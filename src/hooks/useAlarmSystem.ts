import { useEffect, useRef } from 'react';
import { PrayerTimings } from '../lib/api';
import { parse, format, differenceInMinutes, isSameMinute, addMinutes } from 'date-fns';
import { useLocalStorage } from 'usehooks-ts';
import { useSettings } from './useSettings';

export function useAlarmSystem(timings: PrayerTimings | null) {
  const { settings } = useSettings();
  const [alarms] = useLocalStorage<Record<string, boolean>>('islamic-alarms-v2', {
    'Fajr': true, 'Zuhr': true, 'Asr \u2014 Hanafi': true, 'Maghrib': true, 'Isha \u2014 Hanafi': true
  });
  
  const lastAlarmTime = useRef<string | null>(null);

  useEffect(() => {
    // Request permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    if (!settings.alarmsEnabled || !timings) return;

    const interval = setInterval(() => {
      const now = new Date();
      
      const schoolName = settings.school === 1 ? ' \u2014 Hanafi' : '';

      const prayers = [
        { name: 'Fajr', time: timings.Fajr },
        { name: 'Zuhr', time: timings.Dhuhr },
        { name: `Asr${schoolName}`, time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: `Isha${schoolName}`, time: timings.Isha },
      ];

      for (const prayer of prayers) {
        if (!alarms[prayer.name]) continue;

        const prayerDate = parse(prayer.time.split(' ')[0], 'HH:mm', now);
        
        // Exact time alarm
        if (isSameMinute(now, prayerDate)) {
          triggerAlarm(prayer.name, "It is time for prayer.");
        }
        
        // Pre-alarm
        if (settings.preAlarmMinutes > 0) {
          const preAlarmTime = addMinutes(prayerDate, -settings.preAlarmMinutes);
          if (isSameMinute(now, preAlarmTime)) {
            triggerAlarm(prayer.name, `${settings.preAlarmMinutes} minutes remaining for prayer.`, true);
          }
        }
      }
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, [settings.alarmsEnabled, settings.preAlarmMinutes, timings, alarms]);

  const triggerAlarm = (prayerName: string, message: string, isPreAlarm: boolean = false) => {
    const key = `${prayerName}-${isPreAlarm}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;
    if (lastAlarmTime.current === key) return; // Prevent double trigger
    lastAlarmTime.current = key;

    // Vibrate
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }

    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🕌 ${prayerName} Prayer`, {
        body: message,
        icon: '/icon-192.png' // Make sure you have this in real PWA
      });
    }

    // Audio - we can use an Audio object
    // In browser must be interacted first, so this might fail if no interaction
    try {
      let soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3';
      
      if (!isPreAlarm) {
        if (settings.alarmSound === 'azan-mecca') {
          soundUrl = 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/makkah-adhan/Makkah-Adhan-01.mp3';
        } else if (settings.alarmSound === 'azan-medina') {
          soundUrl = 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/madinah-adhan/Madinah-Adhan-01.mp3';
        } else if (settings.alarmSound === 'chime') {
          soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3';
        }
      } else {
        // Pre-alarms always play a gentle chime
        soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3';
      }

      const audio = new Audio(soundUrl);
      audio.play().catch(e => console.log('Audio play failed, likely lacking user interaction', e));
    } catch(e) {}
  };
}

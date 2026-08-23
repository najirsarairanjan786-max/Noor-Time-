import { useEffect, useRef } from 'react';
import { showNotification } from "../lib/notifications";
import { PrayerTimings } from '../lib/api';
import { parse, format, differenceInMinutes, isSameMinute, addMinutes } from 'date-fns';
import { useLocalStorage } from 'usehooks-ts';
import { useSettings } from './useSettings';

export function useAlarmSystem(timings: PrayerTimings | null) {
  const { settings } = useSettings();
  const alarms = settings.prayerAlarms || { 'Fajr': true, 'Zuhr': true, 'Asr': true, 'Maghrib': true, 'Isha': true };
  
  const lastAlarmTime = useRef<string | null>(null);

  useEffect(() => {
    if (!settings.alarmsEnabled || !timings) return;

    let preAlarmMinutes = settings.preAlarmMinutes || 10;
    const schoolName = settings.school === 1 ? ' \u2014 Hanafi' : '';

    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Zuhr', time: timings.Dhuhr },
      { name: `Asr${schoolName}`, time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: `Isha${schoolName}`, time: timings.Isha },
    ];

    const checkAlarms = () => {
      const now = new Date();
      const currentHm = format(now, 'HH:mm');

      for (const prayer of prayers) {
        const baseNameMatch = prayer.name.match(/(Fajr|Zuhr|Asr|Maghrib|Isha)/i);
        const baseName = baseNameMatch ? baseNameMatch[0] : prayer.name;
        if (alarms[baseName] === false) continue;

        const prayerTimeStr = prayer.time.split(' ')[0]; // "15:30"
        
        // Exact time alarm check
        if (prayerTimeStr === currentHm) {
          triggerAlarm(prayer.name, "It is time for prayer.");
        }

        // Pre-alarm check
        const prayerDate = parse(prayerTimeStr, 'HH:mm', now);
        const preAlarmDate = addMinutes(prayerDate, -preAlarmMinutes);
        const preAlarmHm = format(preAlarmDate, 'HH:mm');

        if (preAlarmHm === currentHm) {
          triggerAlarm(prayer.name, `${preAlarmMinutes} minutes remaining for prayer.`, true);
        }
      }
    };

    // Check immediately and then every 10 seconds
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);

    return () => clearInterval(interval);
  }, [settings.alarmsEnabled, settings.preAlarmMinutes, timings, settings.prayerAlarms]);

  const triggerAlarm = (prayerName: string, message: string, isPreAlarm: boolean = false) => {
    const key = `${prayerName}-${isPreAlarm}-${format(new Date(), 'yyyy-MM-dd-HH-mm')}`;
    if (lastAlarmTime.current === key) return; // Prevent double trigger
    lastAlarmTime.current = key;

    // Vibrate
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }

    // Notification
    if (settings.pushNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      showNotification(`🕌 ${prayerName} Prayer`, {
        body: message,
        icon: '/icon-192.png' // Make sure you have this in real PWA
      });
    }

    // Audio - we can use an Audio object
    // In browser must be interacted first, so this might fail if no interaction
    try {
      let soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3';
      
      const ALL_SOUNDS: Record<string, string> = {
        'beep': 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
        'chime': 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3',
        'azan-mecca': 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/makkah-adhan/Makkah-Adhan-01.mp3',
        'azan-medina': 'https://media.blubrry.com/muslim_central_quran/podcasts.qurancentral.com/madinah-adhan/Madinah-Adhan-01.mp3',
        'azan-al-aqsa': 'https://archive.org/download/AdhanAlAqsa/Adhan%20Al%20Aqsa.mp3',
        'azan-mishary': 'https://archive.org/download/AdhanMishary/Adhan%20Mishary.mp3',
        'azan-abdul-basit': 'https://archive.org/download/AdhanAbdulBasit/Adhan%20Abdul%20Basit.mp3',
      };
      
      if (!isPreAlarm) {
        // Extract base prayer name to check against specific settings
        const basePrayerMatch = prayerName.match(/(Fajr|Zuhr|Asr|Maghrib|Isha)/i);
        const basePrayer = basePrayerMatch ? basePrayerMatch[0] : '';
        
        let selectedSound = settings.alarmSound; 
        if (basePrayer && settings.prayerAlarmSounds && settings.prayerAlarmSounds[basePrayer]) {
            const specificSound = settings.prayerAlarmSounds[basePrayer];
            if (specificSound !== 'default') {
                selectedSound = specificSound as any;
            }
        }
        
        soundUrl = ALL_SOUNDS[selectedSound] || ALL_SOUNDS['beep'];
      } else {
        // Pre-alarms always play a gentle chime
        soundUrl = ALL_SOUNDS['chime'];
      }

      const audio = new Audio(soundUrl);
      audio.play().catch(e => console.log('Audio play failed, likely lacking user interaction', e));
    } catch(e) {}
  };
}

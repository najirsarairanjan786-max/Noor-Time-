import cron from 'node-cron';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import config from '../firebase-applet-config.json';
import { 
  Coordinates, 
  CalculationMethod, 
  PrayerTimes, 
  Madhab 
} from 'adhan';
import { format, addMinutes, subMinutes } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getCalculationMethod(methodId: number) {
  switch (methodId) {
    case 1: return CalculationMethod.Karachi();
    case 2: return CalculationMethod.NorthAmerica();
    case 3: return CalculationMethod.MuslimWorldLeague();
    case 4: return CalculationMethod.UmmAlQura();
    case 5: return CalculationMethod.Egyptian();
    default: return CalculationMethod.UmmAlQura();
  }
}

export function startScheduler() {
  // Run at the start of every minute
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Running prayer times scheduler...');
      const db = getFirestore(config.firestoreDatabaseId);
      
      // Get all users who have prayerSettings and push notifications enabled
      const usersSnapshot = await db.collection('users').get();
      
      const now = new Date();
      
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        if (!userData.prayerSettings) continue;
        
        const settings = userData.prayerSettings;
        
        if (!settings.alarmsEnabled || !settings.pushNotificationsEnabled) continue;
        if (!settings.location || !settings.location.lat) continue;
        
        const timezone = settings.timezone || 'UTC';
        
        try {
          const coordinates = new Coordinates(settings.location.lat, settings.location.lng);
          const params = getCalculationMethod(settings.method);
          params.madhab = settings.school === 1 ? Madhab.Hanafi : Madhab.Shafi;
          
          // Use user's local date to calculate prayer times
          const localDate = toZonedTime(now, timezone);
          const prayerTimes = new PrayerTimes(coordinates, localDate, params);
          
          const userDayOfWeek = parseInt(formatInTimeZone(now, timezone, 'i')); // 1=Mon, ..., 5=Fri
          const currentMinute = formatInTimeZone(now, timezone, 'HH:mm');

          const prayers: Array<{name: string, time?: Date, localTimeString?: string, isJuma?: boolean, isKhutbah?: boolean, isThursdayReminder?: boolean}> = [
            { name: 'Fajr', time: prayerTimes.fajr },
            { name: 'Asr', time: prayerTimes.asr },
            { name: 'Maghrib', time: prayerTimes.maghrib },
            { name: 'Isha', time: prayerTimes.isha },
          ];

          if (userDayOfWeek === 5) { // Friday
            const defaultKhutbahTimeString = formatInTimeZone(prayerTimes.dhuhr, timezone, 'HH:mm');
            const defaultJumaTime = addMinutes(prayerTimes.dhuhr, 30);
            const defaultJumaTimeString = formatInTimeZone(defaultJumaTime, timezone, 'HH:mm');

            const khutbahTimeStr = settings.customTimings?.['JummaKhutbah'] || defaultKhutbahTimeString;
            const jumaTimeStr = settings.customTimings?.['Jumma'] || defaultJumaTimeString;

            prayers.push({ name: 'JummaKhutbah', localTimeString: khutbahTimeStr, isKhutbah: true });
            prayers.push({ name: 'Jumma', localTimeString: jumaTimeStr, isJuma: true });
          } else {
            prayers.push({ name: 'Dhuhr', time: prayerTimes.dhuhr });
          }

          if (userDayOfWeek === 4) { // Thursday
            const defaultJumaTime = addMinutes(prayerTimes.dhuhr, 30);
            const defaultJumaTimeString = formatInTimeZone(defaultJumaTime, timezone, 'HH:mm');
            const jumaTimeStr = settings.customTimings?.['Jumma'] || defaultJumaTimeString;
            prayers.push({ name: 'Jumma', localTimeString: jumaTimeStr, isJuma: true, isThursdayReminder: true });
          }
          
          const subtractMinsStr = (timeStr: string, mins: number) => {
            const [h, m] = timeStr.split(':').map(Number);
            const totalMins = h * 60 + m - mins;
            const newH = Math.floor((totalMins + 24 * 60) / 60) % 24;
            const newM = (totalMins + 24 * 60) % 60;
            return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
          };

          for (const prayer of prayers) {
            if (!prayer.time && !prayer.localTimeString) continue;
            
            let prayerMinute = '';
            let formattedTime = '';

            if (prayer.localTimeString) {
               prayerMinute = prayer.localTimeString;
               const [h, m] = prayerMinute.split(':').map(Number);
               const suffix = h >= 12 ? 'PM' : 'AM';
               const displayH = h % 12 || 12;
               formattedTime = `${displayH}:${m.toString().padStart(2, '0')} ${suffix}`;
            } else if (prayer.time) {
               prayerMinute = formatInTimeZone(prayer.time, timezone, 'HH:mm');
               formattedTime = formatInTimeZone(prayer.time, timezone, 'h:mm a');
            }
            
            // Check pre-alarm
            let preAlarmMins = settings.preAlarmMinutes || 0;
            if (prayer.isKhutbah) preAlarmMins = 60;
            else if (prayer.isJuma && !prayer.isThursdayReminder) preAlarmMins = 15;
            else if (prayer.isThursdayReminder) preAlarmMins = 0; // The reminder itself triggers exactly at that minute

            let preAlarmMinute = null;
            if (preAlarmMins > 0) {
              preAlarmMinute = subtractMinsStr(prayerMinute, preAlarmMins);
            }
            
            let isPrayerTime = currentMinute === prayerMinute;
            let isPreAlarmTime = preAlarmMinute !== null && currentMinute === preAlarmMinute;
            
            const soundPref = settings.prayerAlarmSounds?.[prayer.name] || settings.alarmSound || 'default';
            if (soundPref === 'off') continue;
            
            if (isPrayerTime || isPreAlarmTime) {
              let message = '';
              let title = '';

              if (prayer.isThursdayReminder) {
                 title = 'Tomorrow is Juma!';
                 message = `Juma prayer will be at ${formattedTime} tomorrow in ${settings.location.name}.`;
              } else if (prayer.isKhutbah) {
                 if (isPrayerTime) {
                    title = 'Time for Juma Khutbah';
                    message = `Juma Khutbah starts now at ${formattedTime} in ${settings.location.name}.`;
                 } else {
                    title = 'Upcoming: Juma Khutbah';
                    message = `Juma Khutbah will start in 1 hour at ${formattedTime}.`;
                 }
              } else if (prayer.isJuma) {
                 if (isPrayerTime) {
                    title = 'Time for Juma Prayer';
                    message = `Juma Prayer starts now at ${formattedTime} in ${settings.location.name}.`;
                 } else {
                    title = 'Upcoming: Juma Prayer';
                    message = `Juma Prayer will start in 15 minutes at ${formattedTime}.`;
                 }
              } else {
                 title = isPrayerTime ? `Time for ${prayer.name}` : `Upcoming: ${prayer.name}`;
                 message = isPrayerTime 
                   ? `${prayer.name} Prayer Time - ${formattedTime} in ${settings.location.name}. It is time for prayer.`
                   : `${prayer.name} Prayer will start in ${preAlarmMins} minutes at ${formattedTime}.`;
              }
              
              await sendPrayerNotificationToUser(doc.id, title, message, soundPref);
            }
          }
        } catch (err) {
          console.error(`Error processing prayers for user ${doc.id}:`, err);
        }
      }
    } catch (err) {
      console.error('Error in cron job:', err);
    }
  });
  console.log('Prayer times background scheduler started.');
}

async function sendPrayerNotificationToUser(userId: string, title: string, body: string, sound: string) {
  const db = getFirestore(config.firestoreDatabaseId);
  const tokensSnapshot = await db.collection('users').doc(userId).collection('fcmTokens').get();
  
  if (tokensSnapshot.empty) return;
  
  const tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(Boolean);
  if (tokens.length === 0) return;
  
  const uniqueTokens = [...new Set(tokens)];
  
  const payload = {
    notification: {
      title,
      body,
    },
    data: {
      type: 'prayer_alarm',
      sound: sound
    },
    android: {
      priority: 'high' as const,
      notification: {
        sound: sound === 'default' ? 'default' : sound,
        channelId: 'prayer_alarms_channel',
        visibility: 'public' as const,
        defaultSound: sound === 'default',
        defaultVibrateTimings: true,
        defaultLightSettings: true,
      }
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          sound: sound === 'default' ? 'default' : `${sound}.caf`,
        }
      }
    },
    webpush: {
      headers: {
        Urgency: 'high',
      },
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: true,
      }
    },
    tokens: uniqueTokens
  };
  
  const response = await getMessaging().sendEachForMulticast(payload);
  
  // Cleanup failed tokens
  if (response.failureCount > 0) {
    const tokensToDelete: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === 'messaging/registration-token-not-registered' ||
          errorCode === 'messaging/invalid-registration-token'
        ) {
          tokensToDelete.push(uniqueTokens[idx]);
        }
      }
    });
    
    if (tokensToDelete.length > 0) {
      const batch = db.batch();
      tokensSnapshot.docs.forEach(doc => {
        if (tokensToDelete.includes(doc.data().token)) {
          batch.delete(doc.ref);
        }
      });
      await batch.commit();
    }
  }
}

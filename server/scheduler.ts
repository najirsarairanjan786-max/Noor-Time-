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
import { format, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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
          
          const prayers = [
            { name: 'Fajr', time: prayerTimes.fajr },
            { name: 'Dhuhr', time: prayerTimes.dhuhr },
            { name: 'Asr', time: prayerTimes.asr },
            { name: 'Maghrib', time: prayerTimes.maghrib },
            { name: 'Isha', time: prayerTimes.isha },
          ];
          
          for (const prayer of prayers) {
            if (!prayer.time) continue;
            
            // Format both times to 'HH:mm' for minute-level precision matching
            const currentMinute = format(now, 'HH:mm');
            const prayerMinute = format(prayer.time, 'HH:mm');
            
            // Check pre-alarm
            const preAlarmMins = settings.preAlarmMinutes || 0;
            let preAlarmMinute = null;
            if (preAlarmMins > 0) {
              const preAlarmTime = addMinutes(prayer.time, -preAlarmMins);
              preAlarmMinute = format(preAlarmTime, 'HH:mm');
            }
            
            let isPrayerTime = currentMinute === prayerMinute;
            let isPreAlarmTime = preAlarmMinute !== null && currentMinute === preAlarmMinute;
            
            const soundPref = settings.prayerAlarmSounds?.[prayer.name] || settings.alarmSound || 'default';
            if (soundPref === 'off') continue;
            
            if (isPrayerTime || isPreAlarmTime) {
              const formattedTime = format(toZonedTime(prayer.time, timezone), 'h:mm a');
              let message = isPrayerTime 
                ? `${prayer.name} Prayer Time - ${formattedTime} in ${settings.location.name}. It is time for prayer.`
                : `${prayer.name} Prayer will start in ${preAlarmMins} minutes at ${formattedTime}.`;
                
              let title = isPrayerTime ? `Time for ${prayer.name}` : `Upcoming: ${prayer.name}`;
              
              // Note: the native app or service worker needs to map these to actual sounds if using standard Web Push,
              // but for FCM to Android wrappers we can send the sound name.
              
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

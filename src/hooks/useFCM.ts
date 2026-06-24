import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';

export function useFCM() {
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn('Firebase Messaging is not supported in this browser.');
          return;
        }

        const messaging = getMessaging();
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Note: You need to replace this with your actual VAPID key
          const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          
          // A valid VAPID key is usually a long base64 string
          if (!vapidKey || vapidKey.length < 20) {
            console.warn("FCM VAPID key is missing or invalid in environment variables. Push notifications will not be subscribed.");
            return;
          }

          let token;
          try {
            token = await getToken(messaging, { vapidKey });
          } catch (tokenError) {
            console.warn('Could not get FCM token (likely invalid VAPID key or blocked by browser):', tokenError);
            return;
          }
          
          if (token && auth.currentUser) {
            // Save token to Firestore
            const tokenRef = doc(db, 'users', auth.currentUser.uid, 'fcmTokens', token);
            await setDoc(tokenRef, {
              token,
              createdAt: serverTimestamp(),
              userAgent: navigator.userAgent
            });
          }
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        requestPermission();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      try {
        const supported = await isSupported();
        if (!supported) return;

        const messaging = getMessaging();
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Received foreground message:', payload);
          // Display a toast or handle the message
          if (payload.notification) {
            // The browser will not show a push notification if the tab is in focus,
            // so we can show it manually or use a toast
            new Notification(payload.notification.title || 'New Notification', {
              body: payload.notification.body
            });
          }
        });
        return unsubscribe;
      } catch (error) {
        // Messaging not supported
      }
    };

    let unsubscribeFunc: (() => void) | undefined;
    setupListener().then(unsub => {
      if (unsub) unsubscribeFunc = unsub;
    });

    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
    };
  }, []);
}

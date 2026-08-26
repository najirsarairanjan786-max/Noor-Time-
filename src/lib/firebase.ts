import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  initializeFirestore, setLogLevel, memoryLocalCache
} from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import defaultFirebaseConfig from "../../firebase-applet-config.json";


// Cleanup any stuck Firestore offline persistence data from localStorage

// Clear large app caches that might be hogging localStorage and causing QuotaExceededError
try {
  const largeCachePrefixes = [
    'jantri_book_data_',
    'quran_juz_',
    'jantri_calendar_',
    'adhan_timings_',
    'hijri_date_',
    'islamic_calendar_',
  ];
  
  const appKeysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Clear firestore local cache to free up space
      if (key.startsWith('firestore_')) {
        appKeysToRemove.push(key);
      }
      // Clear our own large caches
      for (const prefix of largeCachePrefixes) {
        if (key.startsWith(prefix)) {
          appKeysToRemove.push(key);
          break;
        }
      }
    }
  }
  appKeysToRemove.forEach(key => localStorage.removeItem(key));
} catch (e) {
  console.warn("Failed to clear caches from local storage", e);
}


// Helper to get settings from local storage
function getSettings() {
  try {
    const raw = localStorage.getItem("islamic-app-settings-v11");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse settings", e);
  }
  return {};
}

const settings = getSettings();

const customConfigFromEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use settings if complete, else use env vars if complete, else use default AI studio config
const isComplete = (config: any) => config && config.apiKey && config.projectId;

let finalConfig: Record<string, string> = { ...defaultFirebaseConfig };

if (isComplete(settings.firebaseConfig)) {
  console.log("🔥 Using Firebase Config from Local Settings!");
  finalConfig = { ...settings.firebaseConfig };
} else if (isComplete(customConfigFromEnv)) {
  console.log("🔥 Using Firebase Config from Environment Variables (.env)!");
  finalConfig = { ...customConfigFromEnv };
} else {
  console.log("🔥 Using Default AI Studio Firebase Config.");
}

setLogLevel('silent');

// Sanitize projectId in case user accidentally pasted authDomain
if (finalConfig.projectId && finalConfig.projectId.endsWith(".firebaseapp.com")) {
  finalConfig.projectId = finalConfig.projectId.replace(".firebaseapp.com", "");
}

// Ensure databaseId is set if using the default AI Studio project
if (finalConfig.projectId === defaultFirebaseConfig.projectId) {
  finalConfig.firestoreDatabaseId = defaultFirebaseConfig.firestoreDatabaseId;
}

const app = initializeApp(finalConfig);

// Initialize Firestore
export const db = initializeFirestore(app, { experimentalForceLongPolling: true, localCache: memoryLocalCache() }, finalConfig.firestoreDatabaseId || "(default)");

export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize messaging conditionally
export const messaging = async () => {
  try {
    if (await isSupported()) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn("Firebase Messaging is not supported in this environment");
  }
  return null;
};

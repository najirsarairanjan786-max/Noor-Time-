import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import defaultFirebaseConfig from "../../firebase-applet-config.json";

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

// Sanitize projectId in case user accidentally pasted authDomain
if (finalConfig.projectId && finalConfig.projectId.endsWith(".firebaseapp.com")) {
  finalConfig.projectId = finalConfig.projectId.replace(".firebaseapp.com", "");
}

// Ensure databaseId is set if using the default AI Studio project
if (finalConfig.projectId === defaultFirebaseConfig.projectId) {
  finalConfig.firestoreDatabaseId = defaultFirebaseConfig.firestoreDatabaseId;
}

const app = initializeApp(finalConfig);

// Initialize Firestore with offline persistence enabled
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  finalConfig.firestoreDatabaseId
);

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

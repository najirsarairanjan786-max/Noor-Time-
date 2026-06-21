import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
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

let finalConfig = defaultFirebaseConfig;

if (isComplete(settings.firebaseConfig)) {
  console.log("🔥 Using Firebase Config from Local Settings!");
  finalConfig = { ...defaultFirebaseConfig, ...settings.firebaseConfig };
} else if (isComplete(customConfigFromEnv)) {
  console.log("🔥 Using Firebase Config from Environment Variables (.env)!");
  finalConfig = { ...defaultFirebaseConfig, ...customConfigFromEnv };
} else {
  console.log("🔥 Using Default AI Studio Firebase Config.");
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
  finalConfig.firestoreDatabaseId ||
    "ai-studio-e42ae39e-57a1-4111-ad73-90ee70161bad",
);

export const auth = getAuth(app);

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export interface AppSettings {
  location: { lat: number; lng: number; name: string } | null;
  autoLocation: boolean;
  method: number; // Calculation method
  school: number; // Asr calculation method (0: Shafi, 1: Hanafi)
  theme: "dark" | "light" | "ocean" | "desert" | "forest" | "sunset";
  language: string;
  alarmsEnabled: boolean;
  fontSize: "small" | "medium" | "large";
  preAlarmMinutes: number;
  alarmSound: "beep" | "azan-mecca" | "azan-medina" | "chime" | "azan-al-aqsa" | "azan-mishary" | "azan-abdul-basit";
  hijriOffset: number;
  customTimings: Record<string, string>;
  silentMode: boolean;
  pushNotificationsEnabled: boolean;
  customAlarms: Record<string, string>;
  prayerAlarmSounds: Record<string, string>;
  supabaseUrl: string;
  supabaseAnonKey: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  // Saudi Arabia Defaults
  location: null,
  autoLocation: true,
  method: 4, // Umm al-Qura (Makkah)
  school: 0, // Standard (Shafi, Maliki, Hanbali)
  theme: "dark",
  language: "en",
  alarmsEnabled: true,
  fontSize: "medium",
  preAlarmMinutes: 10,
  alarmSound: "beep",
  prayerAlarmSounds: {},
  hijriOffset: 0,
  customTimings: {},
  silentMode: false,
  pushNotificationsEnabled: true,
  customAlarms: {},
  supabaseUrl: "",
  supabaseAnonKey: "",
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "islamic-app-settings-v11",
    DEFAULT_SETTINGS,
  );

  // Sync essential settings to Firestore for the background prayer time scheduler
  useEffect(() => {
    if (!auth.currentUser) return;
    if (!settings.location) return;

    const syncSettings = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser!.uid);
        await setDoc(userRef, {
          prayerSettings: {
            location: settings.location,
            method: settings.method,
            school: settings.school,
            alarmsEnabled: settings.alarmsEnabled,
            pushNotificationsEnabled: settings.pushNotificationsEnabled,
            prayerAlarmSounds: settings.prayerAlarmSounds || {},
            alarmSound: settings.alarmSound,
            preAlarmMinutes: settings.preAlarmMinutes,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }, { merge: true });
      } catch (err) {
        console.error("Failed to sync settings to Firestore:", err);
      }
    };
    
    // Debounce the sync slightly
    const timeout = setTimeout(syncSettings, 2000);
    return () => clearTimeout(timeout);
  }, [
    settings.location, 
    settings.method, 
    settings.school, 
    settings.alarmsEnabled, 
    settings.pushNotificationsEnabled, 
    settings.prayerAlarmSounds, 
    settings.alarmSound, 
    settings.preAlarmMinutes
  ]);

  // Helper to request geolocation
  const requestLocation = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
              // Optional: reverse geocode to get city name
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                  headers: {
                    "Accept-Language": "en-US,en;q=0.9",
                  },
                },
              );
              if (!res.ok) throw new Error("Reverse geocoding failed");
              const data = await res.json();
              const city =
                data.address?.city ||
                data.address?.town ||
                data.address?.state ||
                "Current Location";
              setSettings((prev) => ({
                ...prev,
                location: { lat, lng, name: city },
              }));
              resolve();
            } catch (e) {
              setSettings((prev) => ({
                ...prev,
                location: { lat, lng, name: "Current Location" },
              }));
              resolve();
            }
          },
          (error) => {
            console.warn("Error getting location: ", error);
            // Default to Makkah if location fails
            setSettings((prev) => ({
              ...prev,
              location: {
                lat: 21.3891,
                lng: 39.8579,
                name: "Makkah, Saudi Arabia",
              },
              autoLocation: false,
            }));
            reject(error);
          },
          { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
        );
      } else {
        reject(new Error("Geolocation not supported"));
      }
    });
  }, [setSettings]);

  return { settings, setSettings, requestLocation };
}

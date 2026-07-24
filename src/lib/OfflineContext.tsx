import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

interface OfflineContextType {
  isOfflineMode: boolean;
  isOnline: boolean;
  setOfflineMode: (v: boolean) => void;
  downloadOfflineData: () => Promise<void>;
  clearOfflineData: () => void;
  isDownloading: boolean;
  downloadProgress: number;
  lastSyncDate: string | null;
  cacheSize: string;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOfflineMode, setOfflineMode] = useLocalStorage("offline_mode_enabled", false);
  const [lastSyncDate, setLastSyncDate] = useLocalStorage<string | null>("offline_last_sync", null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cacheSize, setCacheSize] = useState("0 B");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    calculateCacheSize();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const calculateCacheSize = () => {
    let _size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        _size += localStorage.getItem(key)?.length || 0;
      }
    }
    const kb = _size / 1024;
    if (kb > 1024) {
      setCacheSize((kb / 1024).toFixed(2) + " MB");
    } else {
      setCacheSize(kb.toFixed(2) + " KB");
    }
  };

  
  const downloadOfflineData = async () => {
    if (!navigator.onLine) {
      alert("Please connect to the internet to download offline data.");
      return;
    }
    setIsDownloading(true);
    setDownloadProgress(10);
    
    try {
      setDownloadProgress(30);
      
      // Attempt to silently fetch current location's prayer times
      const settingsStr = localStorage.getItem("islamic-settings-v2");
      let lat = 21.4225;
      let lng = 39.8262;
      let method = 1;
      let school = 1;
      
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          if (settings.location) {
             lat = settings.location.lat;
             lng = settings.location.lng;
          }
          if (settings.method) method = settings.method;
          if (settings.school) school = settings.school;
        } catch(e) {}
      }
      
      setDownloadProgress(60);
      
      // Import and fetch
      const { fetchPayerTimes, fetchHijriDate } = await import('./api');
      await fetchPayerTimes(lat, lng, method, school);
      await fetchHijriDate(new Date());
      
      setDownloadProgress(100);
      
      // Mark sync date
      const now = new Date().toISOString();
      setLastSyncDate(now);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        calculateCacheSize();
        setOfflineMode(true);
      }, 500);
      
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };


  const clearOfflineData = () => {
    // Only clear specific caches to not delete user settings
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("prayer_times_") || key.startsWith("hijri_date_") || key.startsWith("offline_") || key === "jantri_book_data_v11")) {
        if (key !== "offline_mode_enabled") {
            keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setLastSyncDate(null);
    setOfflineMode(false);
    calculateCacheSize();
  };

  return (
    <OfflineContext.Provider value={{
      isOfflineMode,
      isOnline,
      setOfflineMode,
      downloadOfflineData,
      clearOfflineData,
      isDownloading,
      downloadProgress,
      lastSyncDate,
      cacheSize
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) throw new Error("useOffline must be used within OfflineProvider");
  return context;
};

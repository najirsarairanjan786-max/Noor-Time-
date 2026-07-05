import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Cloud, CloudOff } from "@/src/lib/icons";
import { motion, AnimatePresence } from "motion/react";

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] mx-auto max-w-md bg-amber-500 text-white px-4 py-1.5 flex items-center justify-center gap-2 shadow-md bg-opacity-90 backdrop-blur-sm"
        >
          <WifiOff className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white tracking-wide">
            Offline Mode - Data saved locally, will sync when online.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

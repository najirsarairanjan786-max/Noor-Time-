import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WifiOff, CheckCircle2 } from "lucide-react";
import { useOffline } from "../lib/OfflineContext";

export function OfflineBanner() {
  const { isOnline, isOfflineMode } = useOffline();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      setShowRestored(true);
      setWasOffline(false);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {(!isOnline || isOfflineMode) && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none px-4"
        >
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 text-slate-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium pointer-events-auto max-w-sm w-full mx-auto justify-center">
            <WifiOff className="w-4 h-4 text-amber-500" />
            Offline Mode Active
          </div>
        </motion.div>
      )}

      {showRestored && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none px-4"
        >
          <div className="bg-emerald-500/90 backdrop-blur-md border border-emerald-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium pointer-events-auto max-w-sm w-full mx-auto justify-center">
            <CheckCircle2 className="w-4 h-4" />
            Data Updated Successfully
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

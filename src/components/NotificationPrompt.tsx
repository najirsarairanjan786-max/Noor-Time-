import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X } from "lucide-react";
import { useSettings } from "../hooks/useSettings";

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { settings, setSettings } = useSettings();

  useEffect(() => {
    // Check if we should show the prompt
    const hasPrompted = localStorage.getItem("notification_prompt_dismissed");

    // Only show if notifications are supported, not already granted/denied, and we haven't prompted yet
    if (
      "Notification" in window &&
      Notification.permission === "default" &&
      !hasPrompted
    ) {
      // Small delay to not overwhelm the user immediately on load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestNotification = () => {
    if (!("Notification" in window)) return;

    Notification.requestPermission().then((permission) => {
      setShowPrompt(false);
      localStorage.setItem("notification_prompt_dismissed", "true");

      if (permission === "granted") {
        setSettings((prev) => ({
          ...prev,
          pushNotificationsEnabled: true,
        }));

        try {
          new Notification("Notifications Active", {
            body: "You will now receive prayer time alerts.",
            icon: "/icon.png",
          });
        } catch (e) {}
      } else {
        setSettings((prev) => ({
          ...prev,
          pushNotificationsEnabled: false,
        }));
      }
    });
  };

  const dismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("notification_prompt_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 flex justify-center"
        >
          <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/30 shadow-2xl rounded-2xl p-4 max-w-sm w-full">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">
                    Allow Notifications
                  </h3>
                  <p className="text-emerald-100/70 text-sm leading-relaxed mb-3">
                    Get timely alerts for prayer times and daily reminders.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={requestNotification}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Enable
                    </button>
                    <button
                      onClick={dismiss}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Not Now
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from "react";
import { showNotification } from "../lib/notifications";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "./useSettings";

export function useTasbeehAlarms() {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);

  useEffect(() => {
    // Only check every minute
    const interval = setInterval(() => {
      try {
        const remindersEnabled = JSON.parse(localStorage.getItem('islamic-tasbeeh-reminders') || 'false');
        if (!remindersEnabled) return;

        const reminderTime = JSON.parse(localStorage.getItem('islamic-tasbeeh-reminder-time') || '"09:00"');
        
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        
        if (currentTime === reminderTime) {
          const dateStr = now.toISOString().split('T')[0];
          const storageKey = `islamic-tasbeeh-alerted-${dateStr}`;
          
          if (!localStorage.getItem(storageKey)) {
             const title = t("tasbeehReminders") || "Daily Tasbeeh Reminder";
             const body = "It's time for your daily Tasbeeh.";
             
             if ("Notification" in window && Notification.permission === "granted") {
               showNotification(title, {
                 body,
                 icon: "/icon.png"
               });
               localStorage.setItem(storageKey, "true");
             }
          }
        }
      } catch (e) {
         // silently ignore json parse errors or permissions
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [t]);
}

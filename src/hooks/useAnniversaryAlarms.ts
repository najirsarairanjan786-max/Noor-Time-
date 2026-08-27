import { useEffect } from "react";
import { showNotification } from "../lib/notifications";
import { useSettings } from "./useSettings";
import { useTranslation } from "../lib/i18n";
import { useData } from "./useData";

export function useAnniversaryAlarms() {
  const { settings } = useSettings();
  const { date } = useData(settings.location, settings.method, settings.school);
  const { t } = useTranslation(settings.language);

  useEffect(() => {
    if (!settings.pushNotificationsEnabled || !date?.hijri) return;

    const currentReminders = settings.anniversaryReminders || {};
    const hijriDay = parseInt(date.hijri.day, 10);
    const hijriMonth = date.hijri.month.number;
    const hijriYear = date.hijri.year;

    const todayId = `${hijriDay}_${hijriMonth}`;

    // If today is one of the anniversary events and it's enabled
    if (currentReminders[todayId]) {
      const storageKey = `jantri_anniversary_alert_${todayId}_${hijriYear}`;
      const hasTriggered = localStorage.getItem(storageKey);

      if (!hasTriggered) {
        // Find the event name
        const EVENT_KEYS: Record<string, string> = {
          "1_9": "ramadanStart",
          "1_10": "eidUlFitr",
          "10_12": "eidUlAdha",
          "1_1": "islamicNewYear",
          "10_1": "ashura",
          "12_3": "mawlid",
          "27_9": "laylatulQadrDate",
          "15_8": "shabEBarat",
          "8_12": "hajjSeason",
        };

        const eventKey = EVENT_KEYS[todayId];
        if (eventKey) {
          const title = t(eventKey as any);
          
          if ("Notification" in window && Notification.permission === "granted") {
            showNotification(title, {
              body: `Today is ${title}.`,
              icon: "/icon.png"
            });
            localStorage.setItem(storageKey, "true");
          } else if ("Notification" in window && Notification.permission !== "denied") {
             Notification.requestPermission().then(permission => {
               if (permission === "granted") {
                 showNotification(title, {
                   body: `Today is ${title}.`,
                   icon: "/icon.png"
                 });
                 localStorage.setItem(storageKey, "true");
               }
             });
          }
        }
      }
    }
  }, [date?.hijri, settings.anniversaryReminders, settings.pushNotificationsEnabled, t]);
}

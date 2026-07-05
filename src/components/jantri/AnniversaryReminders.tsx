import { motion } from "motion/react";
import { useTranslation } from "../../lib/i18n";
import { englishToUrduDigits } from "../../lib/utils";
import { useSettings } from "../../hooks/useSettings";
import { Bell, BellOff, Calendar as CalendarIcon, Info } from "@/src/lib/icons";
import { useState } from "react";

const ANNIVERSARY_EVENTS = [
  { id: "1_9", key: "ramadanStart", hijriDate: "1 Ramadan" },
  { id: "1_10", key: "eidUlFitr", hijriDate: "1 Shawwal" },
  { id: "10_12", key: "eidUlAdha", hijriDate: "10 Dhul Hijjah" },
  { id: "1_1", key: "islamicNewYear", hijriDate: "1 Muharram" },
  { id: "10_1", key: "ashura", hijriDate: "10 Muharram" },
  { id: "12_3", key: "mawlid", hijriDate: "12 Rabi' al-Awwal" },
  { id: "27_9", key: "laylatulQadrDate", hijriDate: "27 Ramadan" },
  { id: "15_8", key: "shabEBarat", hijriDate: "15 Shaban" },
  { id: "8_12", key: "hajjSeason", hijriDate: "8 Dhul Hijjah" },
] as const;

export function AnniversaryReminders() {
  const { settings, setSettings } = useSettings();
  const { t } = useTranslation(settings.language);

  // Default to empty object if undefined
  const currentReminders = settings.anniversaryReminders || {};

  const toggleReminder = async (id: string) => {
    const isEnabled = !!currentReminders[id];
    
    // Request permission if enabling
    if (!isEnabled && "Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    const newReminders = {
      ...currentReminders,
      [id]: !isEnabled
    };
    
    setSettings(prev => ({ ...prev, anniversaryReminders: newReminders }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/10">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 mt-1">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t("anniversaryReminders")}</h2>
            <p className="text-sm text-emerald-200/70 mt-1">
              Enable push notifications for important Islamic dates. Reminders automatically sync with the Hijri calendar every year even when offline.
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {ANNIVERSARY_EVENTS.map((event) => {
            const isEnabled = !!currentReminders[event.id];
            
            return (
              <div 
                key={event.id}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/5 hover:border-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800/50 p-2 rounded-lg text-emerald-100/70">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t(event.key as any)}</div>
                    <div className="text-xs text-emerald-200/60">{englishToUrduDigits(event.hijriDate)}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleReminder(event.id)}
                  className={`p-2.5 rounded-lg transition-all ${
                    isEnabled 
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

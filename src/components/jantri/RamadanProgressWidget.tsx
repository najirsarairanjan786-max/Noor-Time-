import React, { useState } from "react";
import { motion } from "motion/react";
import { format, addDays, parse } from "date-fns";
import { Moon, Star, Sun, Bell, BellOff, Info, Clock, Calendar } from "@/src/lib/icons";
import { useTranslation } from "../../lib/i18n";
import { useSettings } from "../../hooks/useSettings";
import { PrayerTimings, HijriDateInfo, GregorianDateInfo } from "../../lib/api";

interface RamadanProgressWidgetProps {
  timings: PrayerTimings | null;
  hijri: HijriDateInfo | null;
  gregorian: GregorianDateInfo | null;
}

export function RamadanProgressWidget({ timings, hijri, gregorian }: RamadanProgressWidgetProps) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
    const [suhoorReminder, setSuhoorReminder] = useState(false);
  const [iftarReminder, setIftarReminder] = useState(false);

  if (!hijri || !gregorian || !timings) return null;

  const isRamadan = hijri.month.number === 9;
  const ramadanDay = parseInt(hijri.day, 10);
  
  const handleToggleSuhoor = async () => {
    const newValue = !suhoorReminder;
    setSuhoorReminder(newValue);
    if (newValue) {
      // toggle local reminder
    } else {
      // untoggle local reminder
    }
  };

  const handleToggleIftar = async () => {
    const newValue = !iftarReminder;
    setIftarReminder(newValue);
    if (newValue) {
      // toggle local reminder
    } else {
      // untoggle local reminder
    }
  };

  

  
  const completed = isRamadan ? ramadanDay - 1 : 0;
  const remaining = isRamadan ? 30 - ramadanDay : 30;
  const progressPercent = isRamadan ? Math.min(100, Math.max(0, (ramadanDay / 30) * 100)) : 0;
  
  const ashra1Active = isRamadan && ramadanDay <= 10 && ramadanDay > 0;
  const ashra2Active = isRamadan && ramadanDay > 10 && ramadanDay <= 20;
  const ashra3Active = isRamadan && ramadanDay > 20;

  
  const isLaylatAlQadr = isRamadan && [21, 23, 25, 27, 29].includes(ramadanDay);
  const showLaylatAlQadrCard = isLaylatAlQadr || !isRamadan;


  const todayDate = new Date();
  
  // estimate Eid date
  const eidDateEstimate = isRamadan ? addDays(todayDate, remaining + 1) : (() => {
      let monthsUntil = 10 - hijri.month.number;
      if (monthsUntil <= 0) monthsUntil += 12;
      const daysUntilEid = Math.floor((monthsUntil - 1) * 29.5) + (30 - parseInt(hijri.day, 10));
      return addDays(todayDate, daysUntilEid > 0 ? daysUntilEid : 0);
  })();

  // calculate days until Ramadan
  let estimatedDaysUntilRamadan = 0;
  if (!isRamadan) {
    let monthsUntil = 9 - hijri.month.number;
    if (monthsUntil <= 0) monthsUntil += 12;
    estimatedDaysUntilRamadan = Math.floor(monthsUntil * 29.5) - parseInt(hijri.day, 10);
    if (estimatedDaysUntilRamadan < 0) estimatedDaysUntilRamadan = 0;
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a]/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mt-8 -mr-8 text-emerald-500/5 pointer-events-none">
        <Moon className="w-64 h-64" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
          <Moon className="w-5 h-5" />
        </div>
        
          <div>
            <h2 className="text-lg font-bold text-white">{t("ramadanProgress")}</h2>
            {!isRamadan && <div className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded mt-1 inline-block">{t("previewMode")} - {t("daysUntilRamadan")}: ~{estimatedDaysUntilRamadan}</div>}
          </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Progress Section */}
        <div className="bg-emerald-950/40 rounded-xl p-5 border border-emerald-500/10">
          <div className="flex justify-between items-end mb-2">
            <div>
              
              
              <div className="text-3xl font-bold text-white">
                {isRamadan ? (
                  <>{t("roza")} {ramadanDay} {t("of")} 30</>
                ) : (
                  <span className="text-xl text-emerald-200/50">{t("notActive")}</span>
                )}
              </div>

            </div>
            {isLaylatAlQadr && (
              <div className="bg-amber-500/20 text-amber-300 text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1 animate-pulse">
                <Star className="w-3 h-3" />
                {t("laylatAlQadr")}
              </div>
            )}
          </div>

          <div className="w-full bg-emerald-900/50 rounded-full h-3 mb-3 mt-4 overflow-hidden border border-emerald-500/20">
            <motion.div 
              className="bg-emerald-400 h-3 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 rounded-full"></div>
            </motion.div>
          </div>
          
          
          <div className="flex justify-between text-sm text-emerald-200/70 mb-4">
            <span>{t("completed")}: <strong className="text-white">{completed}</strong></span>
            <span>{t("remaining")}: <strong className="text-white">{remaining}</strong></span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className={`text-center p-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${ashra1Active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-900/20 text-emerald-500/50'}`}>
              {t("ashra1")}
            </div>
            <div className={`text-center p-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${ashra2Active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-900/20 text-emerald-500/50'}`}>
              {t("ashra2")}
            </div>
            <div className={`text-center p-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${ashra3Active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-900/20 text-emerald-500/50'}`}>
              {t("ashra3")}
            </div>
          </div>

        </div>

        
        
        {showLaylatAlQadrCard && (
          <div className={`col-span-1 md:col-span-2 rounded-xl p-4 flex items-start gap-3 relative z-10 ${isLaylatAlQadr ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-emerald-950/40 border border-emerald-500/10 opacity-70'}`}>
            <Star className={`w-5 h-5 shrink-0 mt-0.5 ${isLaylatAlQadr ? 'text-amber-400 animate-pulse' : 'text-emerald-400/50'}`} />

            <div>
              
              <div className={`font-bold mb-1 ${isLaylatAlQadr ? 'text-amber-400' : 'text-emerald-300'}`}>{t("laylatAlQadr")} (21, 23, 25, 27, 29)</div>
              <div className={`text-sm ${isLaylatAlQadr ? 'text-amber-200/80' : 'text-emerald-200/60'}`}>{t("laylatAlQadrReminder")}</div>

            </div>
          </div>
        )}
        {/* Timings & Reminders */}
  
        <div className="space-y-3">
          <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-emerald-200/70 uppercase tracking-wider font-semibold">{t("suhoorTime")}</div>
                <div className="text-lg font-bold text-white">{format(parse(timings.Fajr.split(" ")[0], "HH:mm", new Date()), "hh:mm a")}</div>
              </div>
            </div>
            <button 
              onClick={handleToggleSuhoor}
              className={`p-2 rounded-lg transition-colors ${suhoorReminder ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400 hover:text-emerald-300'}`}
              title={t("suhoorReminder")}
            >
              {suhoorReminder ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-emerald-200/70 uppercase tracking-wider font-semibold">{t("iftarTime")}</div>
                <div className="text-lg font-bold text-white">{format(parse(timings.Maghrib.split(" ")[0], "HH:mm", new Date()), "hh:mm a")}</div>
              </div>
            </div>
            <button 
              onClick={handleToggleIftar}
              className={`p-2 rounded-lg transition-colors ${iftarReminder ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400 hover:text-emerald-300'}`}
              title={t("iftarReminder")}
            >
              {iftarReminder ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-emerald-950/30 rounded-xl p-3 border border-emerald-500/10 flex items-center justify-between text-sm relative z-10">
        <div className="flex items-center gap-2 text-emerald-200/80">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>{t("eidEstimated")}</span>
        </div>
        <div className="font-semibold text-white">
          {format(eidDateEstimate, "MMM d, yyyy")}
        </div>
      </div>
    </motion.div>
  );
}

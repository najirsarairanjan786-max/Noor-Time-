import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Info, CrescentMoonIcon as Moon, HijriCalendarIcon as CalendarIcon } from "@/src/lib/icons";
import { useTranslation } from "../../lib/i18n";
import { useSettings } from "../../hooks/useSettings";

const getMoonEmoji = (phaseName: string) => {
  switch (phaseName) {
    case "New Moon": return "🌑";
    case "Waxing Crescent": return "🌒";
    case "First Quarter": return "🌓";
    case "Waxing Gibbous": return "🌔";
    case "Full Moon": return "🌕";
    case "Waning Gibbous": return "🌖";
    case "Last Quarter": return "🌗";
    case "Waning Crescent": return "🌘";
    default: return "🌑";
  }
};

const getPhaseKey = (phaseName: string) => {
  switch (phaseName) {
    case "New Moon": return "moonPhase_newMoon";
    case "Waxing Crescent": return "moonPhase_waxingCrescent";
    case "First Quarter": return "moonPhase_firstQuarter";
    case "Waxing Gibbous": return "moonPhase_waxingGibbous";
    case "Full Moon": return "moonPhase_fullMoon";
    case "Waning Gibbous": return "moonPhase_waningGibbous";
    case "Last Quarter": return "moonPhase_lastQuarter";
    case "Waning Crescent": return "moonPhase_waningCrescent";
    default: return "moonPhase_newMoon";
  }
};

export function MoonPhaseWidget( /* @ts-ignore */ ) {
  const { settings } = useSettings();
  const { t, isRTL } = useTranslation(settings.language);
  const [phase, setPhase] = useState<any>(null);

  useEffect( /* @ts-ignore */ () => {
    // Simple moon phase calculation
    const getMoonPhase = (date: Date) => {
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      const day = date.getDate();
      
      let c = 0;
      let e = 0;
      let jd = 0;
      let b = 0;

      if (month < 3) {
        year--;
        month += 12;
      }

      ++month;
      c = 365.25 * year;
      e = 30.6 * month;
      jd = c + e + day - 694039.09; // jd is total days elapsed
      jd /= 29.5305882; // divide by the moon cycle
      b = parseInt( /* @ts-ignore */ jd.toString()); // int( /* @ts-ignore */ jd) -> b, take integer part of jd
      jd -= b; // subtract integer part to leave fractional part of original jd
      b = Math.round(jd * 8); // scale fraction from 0-8 and round

      if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0

      const phases = [
        "New Moon",
        "Waxing Crescent",
        "First Quarter",
        "Waxing Gibbous",
        "Full Moon",
        "Waning Gibbous",
        "Last Quarter",
        "Waning Crescent"
      ];

      const illumination = Math.round((1 - Math.cos(jd * 2 * Math.PI)) * 50);

      return {
        phase: phases[b],
        illumination,
        age: Math.round(jd * 29.5305882 * 10) / 10
      };
    };

    setPhase(getMoonPhase(new Date()));
  }, []);

  if (!phase) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          <Moon size={24} className="text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {t( /* @ts-ignore */ "moonPhase_title" as any)}
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-6xl mb-4 select-none filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {getMoonEmoji(phase.phase)}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {t( /* @ts-ignore */ getPhaseKey(phase.phase) as any)}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Info size={16} />
              <span>{t( /* @ts-ignore */ "moonPhase_illumination" as any)}: {phase.illumination}%</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarIcon size={16} />
              <span>{t( /* @ts-ignore */ "moonPhase_age" as any)}: {phase.age} {t( /* @ts-ignore */ "moonPhase_days" as any)}</span>
            </div>
          </div>
        </div>

        <div className="w-32 h-32 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${(phase.illumination / 100) * 283} 283`}
              className="text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-white">
              {phase.illumination}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

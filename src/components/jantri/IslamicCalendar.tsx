import { MoonPhaseWidget } from "./MoonPhaseWidget";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, CrescentMoonIcon as Moon } from "@/src/lib/icons";
import { useSettings } from "../../hooks/useSettings";
import { useTranslation } from "../../lib/i18n";
import { englishToUrduDigits } from "../../lib/utils";
export const getMoonPhaseFromHijriDay = (hijriDay: number) => {
  if (hijriDay === 29 || hijriDay === 30 || hijriDay === 1) return "🌑";
  if (hijriDay >= 2 && hijriDay <= 6) return "🌒";
  if (hijriDay >= 7 && hijriDay <= 9) return "🌓";
  if (hijriDay >= 10 && hijriDay <= 13) return "🌔";
  if (hijriDay >= 14 && hijriDay <= 16) return "🌕";
  if (hijriDay >= 17 && hijriDay <= 20) return "🌖";
  if (hijriDay >= 21 && hijriDay <= 23) return "🌗";
  if (hijriDay >= 24 && hijriDay <= 28) return "🌘";
  return "🌑";
};

// Helper to get moon icon opacity based on hijri day (1-30)
const getMoonPhaseOpacity = (hijriDay: number) => {
  // 1-14 increasing (0.1 to 1)
  // 15-30 decreasing (1 to 0.1)
  if (hijriDay <= 14) return 0.1 + (0.9 * (hijriDay / 14));
  return 1 - (0.9 * ((hijriDay - 14) / 16));
};

interface CalendarDay {
  hijri: {
    date: string;
    day: string;
    month: { en: string; ar: string };
    year: string;
    holidays: string[];
  };
  gregorian: {
    date: string;
    day: string;
    month: { en: string };
    year: string;
  };
}

export function IslamicCalendar() {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchMonth() {
      try {
        const month = format(currentDate, "M");
        const year = format(currentDate, "yyyy");
        const lat = settings.location?.lat || 21.3891;
        const lng = settings.location?.lng || 39.8579;
        const method = settings.method;
        
        // Cache key for the month
        const cacheKey = `jantri_cal_${year}_${month}_${lat}_${lng}_${method}_${settings.hijriOffset}`;
        
        let hasCache = false;
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setDays(JSON.parse(cached));
            hasCache = true;
          }
        }
        
        if (!hasCache) setLoading(true);
        
        const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&adjustment=${settings.hijriOffset || 0}`);
        const data = await response.json();
        
        if (isMounted && Array.isArray(data?.data)) {
          const formattedDays = data.data.map((d: any) => ({
            hijri: d.date.hijri,
            gregorian: d.date.gregorian
          }));
          setDays(formattedDays);
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, JSON.stringify(formattedDays));
          }
        }
      } catch (e) {
        console.error("Failed to fetch calendar", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMonth();
    return () => { isMounted = false; };
  }, [currentDate, settings.location?.lat, settings.location?.lng, settings.method, settings.hijriOffset]);

  const handlePrev = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNext = () => setCurrentDate(addMonths(currentDate, 1));

  // Find holidays this month
  const upcomingEvents = days.filter(d => d.hijri.holidays && d.hijri.holidays.length > 0).flatMap(d => 
    d.hijri.holidays.map(h => ({
      name: h,
      hijriDate: `${englishToUrduDigits(d.hijri.day)} ${d.hijri.month.ar} ${englishToUrduDigits(d.hijri.year)}`,
      gregorianDate: `${d.gregorian.day} ${d.gregorian.month.en} ${d.gregorian.year}`
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <MoonPhaseWidget />
      <div className="flex items-center justify-between bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-4">
        <button onClick={handlePrev} className="p-2 hover:bg-emerald-800/50 rounded-full text-emerald-300">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">{format(currentDate, "MMMM yyyy")}</h2>
          {days.length > 0 && !loading && (
            <p className="text-emerald-300/80 text-sm font-urdu">
              {days[0].hijri.month.ar} - {days[days.length - 1].hijri.month.ar} {englishToUrduDigits(days[0].hijri.year)}
            </p>
          )}
        </div>
        <button onClick={handleNext} className="p-2 hover:bg-emerald-800/50 rounded-full text-emerald-300">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-4 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-emerald-400 py-2">
                {day}
              </div>
            ))}
            {/* Blank spaces before the first day of the month */}
            {days.length > 0 && Array.from({ length: new Date(Number(days[0].gregorian.year), Number(days[0].gregorian.month.number) - 1, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 bg-emerald-950/20 rounded-lg"></div>
            ))}
            {days.map((day, i) => {
              const hasHoliday = day.hijri.holidays && day.hijri.holidays.length > 0;
              return (
                <div 
                  key={i} 
                  className={`h-14 p-1 rounded-lg border flex flex-col justify-between relative ${hasHoliday ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-950/40 border-emerald-500/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-emerald-200/50 leading-none">{englishToUrduDigits(day.hijri.day)}</span>
                    <span className={`text-xs font-medium leading-none ${hasHoliday ? 'text-amber-400' : 'text-white'}`}>{day.gregorian.day}</span>
                  </div>
                  <div className="flex items-center justify-center mt-0.5">
                    <span className="text-xs leading-none" style={{ filter: 'grayscale(100%) brightness(1.5)', opacity: getMoonPhaseOpacity(Number(day.hijri.day)) * 0.8 + 0.2 }}>
                      {getMoonPhaseFromHijriDay(Number(day.hijri.day))}
                    </span>
                  </div>
                  {hasHoliday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto mt-0.5"></div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!loading && upcomingEvents.length > 0 && (
        <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Islamic Events ({format(currentDate, "MMMM")})</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/10">
                <div className="bg-emerald-800/50 rounded-lg p-2 text-center min-w-[3.5rem]">
                  <div className="text-xl font-bold text-emerald-300 leading-none">{event.gregorianDate.split(" ")[0]}</div>
                  <div className="text-[10px] text-emerald-200 uppercase mt-1">{event.gregorianDate.split(" ")[1]}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{event.name}</h4>
                  <p className="text-xs text-emerald-400/80 mt-0.5">{event.hijriDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
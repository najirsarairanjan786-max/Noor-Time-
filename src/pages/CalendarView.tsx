import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ViewType } from "../App";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarDays } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../hooks/useSettings";

interface CalendarDayInfo {
  gregorian: { day: string; date: string; month: { en: string } };
  hijri: {
    day: string;
    date: string;
    month: { en: string; ar: string };
    year: string;
    holidays: string[];
  };
}

export function CalendarView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(format(new Date(), "dd-MM-yyyy"));
  const [calendarData, setCalendarData] = useState<CalendarDayInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    date: string;
    events: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchMonth() {
      setLoading(true);
      try {
        let offset = Number(settings.hijriOffset) - 1 + (new Date().getHours() >= 19 ? 1 : 0);
        if (isNaN(offset)) offset = -1 + (new Date().getHours() >= 19 ? 1 : 0);

        const prev = subMonths(currentDate, 1);
        const next = addMonths(currentDate, 1);

        const fetchReq = async (d: Date) => {
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          const cacheKey = `calendar_${m}_${y}`;
          
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              try {
                return JSON.parse(cached);
              } catch(e) {}
            }
          }
          try {
            const r = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${m}/${y}`);
            const data = await r.json();
            if (typeof window !== 'undefined' && data) {
              localStorage.setItem(cacheKey, JSON.stringify(data));
            }
            return data;
          } catch(err) {
            if (typeof window !== 'undefined') {
              const cached = localStorage.getItem(cacheKey);
              if (cached) return JSON.parse(cached);
            }
            throw err;
          }
        };

        const [prevData, currData, nextData] = await Promise.all([
          fetchReq(prev),
          fetchReq(currentDate),
          fetchReq(next),
        ]);

        const flatData = [...prevData.data, ...currData.data, ...nextData.data];
        const startIndex = prevData.data.length;

        const adjustedCalendar = currData.data.map((day: any, idx: number) => {
          const flatIdx = startIndex + idx + offset;
          const mappedHijri = flatData[flatIdx]
            ? flatData[flatIdx].hijri
            : day.hijri;

          const m = parseInt(mappedHijri.month.number);
          const d = parseInt(mappedHijri.day);
          const customHolidays = [];
          if (m === 1 && d === 1) customHolidays.push("1st Muharram (Islamic New Year)");
          if (m === 1 && d === 10) customHolidays.push("Ashura (10th Muharram)");
          if (m === 3 && d === 12) customHolidays.push("Eid Milad-un-Nabi (12 Rabi ul Awwal)");
          if (m === 7 && d === 27) customHolidays.push("Shab e Miraj (27 Rajab)");
          if (m === 8 && d === 15) customHolidays.push("Shab e Barat (15 Shaban)");
          if (m === 9 && d === 1) customHolidays.push("1st Ramadan");
          if (m === 9 && d === 27) customHolidays.push("Shab e Qadr (27 Ramadan)");
          if (m === 10 && d === 1) customHolidays.push("Eid ul-Fitr");
          if (m === 12 && d === 9) customHolidays.push("Day of Arafah (9 Zilhaj)");
          if (m === 12 && d === 10) customHolidays.push("Eid ul-Adha");

          return {
            ...day,
            hijri: {
              ...mappedHijri,
              holidays: Array.from(new Set([...(mappedHijri.holidays || []), ...customHolidays]))
            },
          };
        });

        setCalendarData(adjustedCalendar);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMonth();
  }, [currentDate, settings.hijriOffset]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(format(new Date(), "dd-MM-yyyy"));
  };

  // Determine grid padding
  const startDayOfMonth = getDay(startOfMonth(currentDate)); // 0 = Sun, 1 = Mon
  const blanks = Array.from({ length: startDayOfMonth }).map((_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 px-4 pt-20 max-w-3xl w-full mx-auto min-h-[100dvh] flex flex-col justify-center relative"
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button 
          onClick={() => setView('home')}
          className="p-2 bg-pink-900/50 hover:bg-pink-800/80 rounded-full text-pink-100 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-sm font-medium pr-1">Back</span>
        </button>
        <button
          onClick={goToToday}
          className="p-2 bg-pink-900/50 hover:bg-pink-800/80 rounded-full text-pink-100 transition-colors flex items-center gap-2 pl-3 pr-4"
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Today</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-8 bg-pink-900/60 backdrop-blur-lg border border-pink-500/20 shadow-2xl rounded-2xl p-4 relative">
        <button
          onClick={prevMonth}
          className="p-2 bg-pink-800/40 rounded-full hover:bg-pink-700/50 transition focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        >
          <ChevronLeft className="w-6 h-6 text-pink-200" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          {calendarData.length > 0 && (
            <p
              className="text-sm font-serif text-pink-300 mt-1 font-arabic"
              dir="rtl"
            >
              {calendarData[0].hijri.month.ar} /{" "}
              {calendarData[calendarData.length - 1].hijri.month.ar}{" "}
              {calendarData[0].hijri.year
                .toString()
                .split("")
                .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
                .join("")}{" "}
              ہجری
            </p>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 bg-pink-800/40 rounded-full hover:bg-pink-700/50 transition focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        >
          <ChevronRight className="w-6 h-6 text-pink-200" />
        </button>
      </div>

      <div className="bg-pink-900/60 backdrop-blur-lg border border-pink-500/20 shadow-2xl rounded-2xl p-4 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-pink-950/50 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-2" dir="ltr">
          {[
            { ur: "اتوار", en: "Sun" },
            { ur: "پیر", en: "Mon" },
            { ur: "منگل", en: "Tue" },
            { ur: "بدھ", en: "Wed" },
            { ur: "جمعرات", en: "Thu" },
            { ur: "جمعہ", en: "Fri" },
            { ur: "ہفتہ", en: "Sat" },
          ].map((d) => (
            <div
              key={d.en}
              className="text-center font-semibold text-pink-400/80 p-1 flex flex-col items-center justify-center leading-tight"
            >
              <span className="text-xs md:text-sm font-arabic">{d.ur}</span>
              <span className="text-[10px] md:text-xs text-pink-200/70 font-sans mt-0.5">{d.en}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-1.5" dir="ltr">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square p-1.5"></div>
          ))}
          {calendarData.map((day, idx) => {
            const isToday =
              day.gregorian.date === format(new Date(), "dd-MM-yyyy");
            const isSelected = selectedDate === day.gregorian.date;
            const hasEvents = day.hijri.holidays.length > 0;
            const arabicHijriDay = day.hijri.day
              .toString()
              .split("")
              .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
              .join("");

            return (
              <div
                key={day.gregorian.date}
                onClick={() => {
                  setSelectedDate(day.gregorian.date);
                  if (hasEvents) {
                    setSelectedEvent({
                      date: day.gregorian.date,
                      events: day.hijri.holidays,
                    });
                  }
                }}
                className={cn(
                  "aspect-square p-1 md:p-2 flex flex-col items-center justify-center rounded-xl relative cursor-pointer transition-all",
                  isToday
                    ? "bg-pink-500/80 text-white shadow-md border border-pink-400/50"
                    : isSelected 
                    ? "bg-pink-400/40 text-pink-50 shadow-sm border border-pink-300/60"
                    : "hover:bg-pink-800/50 bg-pink-900/20 text-pink-100",
                  hasEvents && !isToday && !isSelected && "border border-pink-400/30",
                )}
              >
                <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 leading-none">
                  <span
                    className={cn(
                      "text-[9px] md:text-xs font-sans opacity-70",
                      isToday || isSelected ? "opacity-100 text-white" : "text-pink-200"
                    )}
                  >
                    {day.gregorian.day}
                  </span>
                </div>
                <div className="mt-2 md:mt-3 flex items-center justify-center">
                  <span
                    className={cn(
                      "text-lg md:text-2xl font-arabic leading-none",
                      isToday || isSelected ? "font-bold text-white text-shadow" : "text-pink-50"
                    )}
                  >
                    {arabicHijriDay}
                  </span>
                </div>
                {hasEvents && (
                  <>
                    <div className={cn("absolute top-1 right-1 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse", isToday ? "bg-white" : "bg-pink-300")}></div>
                    <span className={cn("absolute bottom-0 text-[8px] md:text-[10px] truncate w-full text-center px-0.5 leading-none", isToday ? "text-pink-100" : "text-pink-200")}>
                      {day.hijri.holidays[0]}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected Date Details Panel */}
      {selectedDate && calendarData.find(d => d.gregorian.date === selectedDate) && (() => {
        const d = calendarData.find(d => d.gregorian.date === selectedDate)!;
        const arabicHijriDay = d.hijri.day
          .toString()
          .split("")
          .map((n) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(n)])
          .join("");
        const arabicHijriYear = d.hijri.year
          .toString()
          .split("")
          .map((n) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(n)])
          .join("");
          
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-pink-900/40 backdrop-blur-md rounded-2xl p-5 border border-pink-500/20 shadow-lg w-full max-w-lg mx-auto"
          >
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-pink-500/20 text-pink-200 p-2.5 rounded-xl border border-pink-500/30">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-medium text-lg tracking-tight">
                    {d.gregorian.day} {d.gregorian.month.en} {d.gregorian.date.split("-")[2]}
                  </h4>
                  <p className="text-pink-300/80 text-sm">{d.hijri.day} {d.hijri.month.en} {d.hijri.year}</p>
                </div>
              </div>
              
              <div className="text-right" dir="rtl">
                <h4 className="text-pink-50 font-arabic font-bold text-2xl">
                  {arabicHijriDay} {d.hijri.month.ar}
                </h4>
                <p className="text-pink-300/80 font-arabic text-sm">{arabicHijriYear} ہجری</p>
              </div>
            </div>
            
            {d.hijri.holidays.length > 0 ? (
               <div className="flex flex-col gap-2">
                 <span className="text-xs text-pink-300 uppercase tracking-widest font-bold">Events on this day</span>
                 {d.hijri.holidays.map((h, i) => (
                   <span
                     key={i}
                     className="text-white text-sm bg-pink-500/80 border border-pink-400/50 px-4 py-2.5 rounded-xl flex items-center shadow-sm"
                   >
                     {h}
                   </span>
                 ))}
               </div>
            ) : (
               <p className="text-pink-200/50 text-sm italic">No special Islamic events on this day.</p>
            )}
          </motion.div>
        );
      })()}

      <div className="mt-8 mb-8 w-full max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-white mb-4 px-2 text-center">Month's Events</h3>
        <div className="space-y-3">
          {calendarData
            .filter((day) => day.hijri.holidays.length > 0)
            .map((day) => {
              const arabicHijriDay = day.hijri.day
                .toString()
                .split("")
                .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
                .join("");
              const arabicHijriYear = day.hijri.year
                .toString()
                .split("")
                .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
                .join("");

              return (
                <div
                  key={`event-list-${day.gregorian.date}`}
                  onClick={() => setSelectedDate(day.gregorian.date)}
                  className={cn("bg-white/10 backdrop-blur-md rounded-2xl p-4 border flex flex-col gap-3 shadow-lg cursor-pointer transition-colors", 
                    selectedDate === day.gregorian.date ? "border-pink-400 bg-white/20" : "border-white/20 hover:bg-white/15")}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-pink-100 bg-black/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                      {day.gregorian.day} {day.gregorian.month.en}
                    </span>
                    <span
                      className="font-arabic font-medium text-pink-50 bg-black/20 px-3 py-1.5 rounded-lg whitespace-nowrap"
                      dir="rtl"
                    >
                      {arabicHijriDay} {day.hijri.month.ar} {arabicHijriYear}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {day.hijri.holidays.map((h, i) => (
                      <span
                        key={i}
                        className="text-white font-bold text-sm bg-pink-500/80 border border-pink-400/50 px-4 py-1.5 rounded-full text-center w-full shadow-sm"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          {calendarData.filter((day) => day.hijri.holidays.length > 0).length === 0 && (
            <p className="text-pink-200/70 text-center py-4 bg-white/5 rounded-2xl border border-white/10">
              No events this month.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white backdrop-blur-lg border border-white/50 shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Islamic Events
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {selectedEvent.date}
              </p>
              <div className="space-y-2">
                {selectedEvent.events.map((evt, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-slate-700 font-medium"
                  >
                    {evt}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors w-full"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

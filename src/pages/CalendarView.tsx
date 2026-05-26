import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export function CalendarView() {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDayInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    date: string;
    events: string[];
  } | null>(null);
  const [isEventsOpen, setIsEventsOpen] = useState(false);

  useEffect(() => {
    async function fetchMonth() {
      setLoading(true);
      try {
        let offset = Number(settings.hijriOffset) - 1 + (new Date().getHours() >= 19 ? 1 : 0);
        if (isNaN(offset)) offset = -1 + (new Date().getHours() >= 19 ? 1 : 0);

        const prev = subMonths(currentDate, 1);
        const next = addMonths(currentDate, 1);

        const fetchReq = (d: Date) =>
          fetch(
            `https://api.aladhan.com/v1/gToHCalendar/${d.getMonth() + 1}/${d.getFullYear()}`,
          ).then((r) => r.json());

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
          return {
            ...day,
            hijri: mappedHijri,
          };
        });

        setCalendarData(adjustedCalendar);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMonth();
  }, [currentDate, settings.hijriOffset]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine grid padding
  const startDayOfMonth = getDay(startOfMonth(currentDate)); // 0 = Sun, 1 = Mon
  const blanks = Array.from({ length: startDayOfMonth }).map((_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 px-4 pt-4 max-w-3xl w-full mx-auto min-h-[100dvh] flex flex-col justify-center"
    >
      <div className="flex items-center justify-between mb-8 bg-pink-900/60 backdrop-blur-lg border border-pink-500/20 shadow-2xl rounded-2xl p-4">
        <button
          onClick={prevMonth}
          className="p-2 bg-pink-800/40 rounded-full hover:bg-pink-700/50 transition"
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
          className="p-2 bg-pink-800/40 rounded-full hover:bg-pink-700/50 transition"
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

        <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-2" dir="rtl">
          {["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"].map(
            (d) => (
              <div
                key={d}
                className="text-center text-sm md:text-base font-semibold text-pink-400/80 p-1 font-arabic"
              >
                {d}
              </div>
            ),
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-1.5" dir="rtl">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square p-1.5"></div>
          ))}
          {calendarData.map((day, idx) => {
            const isToday =
              day.gregorian.date === format(new Date(), "dd-MM-yyyy");
            const hasEvents = day.hijri.holidays.length > 0;
            const arabicHijriDay = day.hijri.day
              .toString()
              .split("")
              .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
              .join("");

            return (
              <div
                key={day.gregorian.date}
                onClick={() =>
                  hasEvents &&
                  setSelectedEvent({
                    date: day.gregorian.date,
                    events: day.hijri.holidays,
                  })
                }
                className={cn(
                  "aspect-square p-1 md:p-2 flex flex-col items-center justify-center rounded-xl relative cursor-pointer transition-all",
                  isToday
                    ? "bg-pink-500/80 text-white shadow-md border border-pink-400/50"
                    : "hover:bg-pink-800/50 bg-pink-900/20 text-pink-100",
                  hasEvents && !isToday && "border border-pink-400/30",
                )}
              >
                <span
                  className={cn(
                    "text-base md:text-lg font-medium",
                    isToday && "font-bold",
                  )}
                >
                  {day.gregorian.day}
                </span>
                <span
                  className={cn(
                    "text-xs md:text-sm font-serif opacity-70",
                    isToday && "opacity-100",
                  )}
                >
                  {arabicHijriDay}
                </span>
                {hasEvents && (
                  <>
                    <div className="absolute top-1 right-1 w-1 h-1 md:w-1.5 md:h-1.5 bg-pink-300 rounded-full animate-pulse"></div>
                    <span className="absolute bottom-0 text-[8px] md:text-[10px] text-pink-200 truncate w-full text-center px-0.5 leading-none">
                      {day.hijri.holidays[0]}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* List of events this month */}
      {calendarData.some((d) => d.hijri.holidays.length > 0) && (
        <div className="mt-4">
          <button
            onClick={() => setIsEventsOpen(!isEventsOpen)}
            className="w-full bg-red-600 backdrop-blur-lg shadow-2xl rounded-2xl p-5 flex justify-center items-center hover:bg-red-700 transition-colors"
          >
            <h3 className="text-lg font-bold text-white text-center">
              Khushi Ka Din 🎉
            </h3>
          </button>

          <AnimatePresence>
            {isEventsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-4 mt-2">
                  <div className="space-y-2">
                    {calendarData
                      .filter((d) => d.hijri.holidays.length > 0)
                      .map((day) => (
                        <div
                          key={`event-${day.gregorian.date}`}
                          className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg text-sm border border-white/10"
                        >
                          <div className="flex flex-col md:flex-row gap-1 md:gap-2 text-white">
                            <span className="font-medium bg-black/20 px-2 py-0.5 rounded text-[10px] md:text-xs text-center">
                              {day.gregorian.day} {day.gregorian.month.en}
                            </span>
                            <span
                              className="font-serif bg-black/20 px-2 py-0.5 rounded text-[10px] md:text-xs text-center font-arabic"
                              dir="rtl"
                            >
                              {day.hijri.day
                                .toString()
                                .split("")
                                .map((d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)])
                                .join("")}{" "}
                              {day.hijri.month.ar}
                            </span>
                          </div>
                          <span className="font-medium text-white text-right text-[10px] md:text-xs leading-tight ml-2">
                            {day.hijri.holidays.join(", ")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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

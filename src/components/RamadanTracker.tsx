import React, { useState, useEffect } from "react";
import { PrayerTimings } from "../lib/api";
import { format, parse, isAfter, isBefore, differenceInSeconds } from "date-fns";
import { motion } from "motion/react";
import { MoonStar, SunMedium, Clock } from "lucide-react";

interface RamadanTrackerProps {
  timings: PrayerTimings | null;
}

export function RamadanTracker({ timings }: RamadanTrackerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timings) return null;

  // Parse timings
  const todayStr = format(now, "dd-MM-yyyy");
  const fajrTime = parse(`${todayStr} ${timings.Fajr}`, "dd-MM-yyyy HH:mm", new Date());
  const maghribTime = parse(`${todayStr} ${timings.Maghrib}`, "dd-MM-yyyy HH:mm", new Date());

  // Determine state
  let isFasting = false;
  let targetTime = fajrTime;
  let title = "Suhoor Ends In";
  let totalDuration = 1;
  let elapsed = 0;
  let progress = 0;

  if (isBefore(now, fajrTime)) {
    // Before Fajr
    isFasting = false;
    targetTime = fajrTime;
    title = "Suhoor Ends In";
    // We don't have previous Maghrib, approximate with 12 hours max for ring
    totalDuration = 12 * 3600;
    elapsed = totalDuration - differenceInSeconds(targetTime, now);
  } else if (isAfter(now, maghribTime)) {
    // After Maghrib
    isFasting = false;
    targetTime = new Date(fajrTime.getTime() + 24 * 60 * 60 * 1000); // Next day's fajr approx
    title = "Suhoor Ends In";
    totalDuration = differenceInSeconds(targetTime, maghribTime);
    elapsed = differenceInSeconds(now, maghribTime);
  } else {
    // Fasting
    isFasting = true;
    targetTime = maghribTime;
    title = "Iftar In";
    totalDuration = differenceInSeconds(maghribTime, fajrTime);
    elapsed = differenceInSeconds(now, fajrTime);
  }

  progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  const remainingSecs = Math.max(0, differenceInSeconds(targetTime, now));
  const h = Math.floor(remainingSecs / 3600);
  const m = Math.floor((remainingSecs % 3600) / 60);
  const s = remainingSecs % 60;

  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  return (
    <div className="max-w-lg mx-auto mt-6 px-1">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0f172a]/60 backdrop-blur-md rounded-3xl p-5 border border-emerald-500/20 shadow-lg relative overflow-hidden"
      >
        <div className="flex items-center justify-between z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {isFasting ? (
                <SunMedium className="w-4 h-4 text-amber-400" />
              ) : (
                <MoonStar className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`text-xs font-bold uppercase tracking-widest ${isFasting ? 'text-amber-400' : 'text-emerald-400'}`}>
                {title}
              </span>
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}
              </span>
              <span className="text-xl font-medium text-white/50">
                {s.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="mt-3 text-sm font-medium text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              {isFasting ? "Current Fast" : "Preparing for Fast"}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <svg width="100" height="100" className="transform -rotate-90 drop-shadow-lg">
              <circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={circleRadius}
                fill="none"
                stroke={isFasting ? "#fbbf24" : "#10b981"}
                strokeWidth="8"
                strokeDasharray={circleCircumference}
                initial={{ strokeDashoffset: circleCircumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-white/90">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

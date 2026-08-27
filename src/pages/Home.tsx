import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { useSettings } from '../hooks/useSettings';
import { useData } from '../hooks/useData';
import { useHijriDate } from '../hooks/useHijriDate';
import { useAuth } from "../hooks/useAuth";
import { 
  Compass, 
  BookOpen, 
  CloudSun, 
  Vibrate, 
  Kaaba, 
  Pencil, 
  Volume2, 
  VolumeX 
} from "@/src/lib/icons";
import { type Dispatch, type SetStateAction } from "react";
import { ViewType } from "../App";

interface HomeProps {
  setView: Dispatch<SetStateAction<ViewType>>;
}

export function Home({ setView }: HomeProps) {
  const { settings, setSettings } = useSettings();
  const { timings } = useData(
    settings.location,
    settings.method ?? 1,
    settings.school ?? 1,
  );
  const { hijriDate } = useHijriDate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDig = (n: number) => n.toString().padStart(2, '0');
  
  const hDay = hijriDate?.day || 1;
  const hMonthName = hijriDate?.month?.en || "Rabi al-awwal";
  const hYear = hijriDate?.year || 1448;

  const plusMinutes = (timeString: string, mins: number) => {
    if (!timeString) return "00:00";
    const [h, m] = timeString.split(':').map(Number);
    if(isNaN(h)) return "00:00";
    const date = new Date();
    date.setHours(h, m + mins);
    return `${formatDig(date.getHours())}:${formatDig(date.getMinutes())}`;
  };

  const pts = [
     { name: "Fajr", azan: timings?.Fajr || "04:38", jamaat: plusMinutes(timings?.Fajr || "04:38", 22) },
     { name: "Sunrise", azan: timings?.Sunrise || "05:52", jamaat: "-" },
     { name: "Dhuhr", azan: timings?.Dhuhr || "12:15", jamaat: plusMinutes(timings?.Dhuhr || "12:15", 15) },
     { name: "Asr", azan: timings?.Asr || "15:30", jamaat: plusMinutes(timings?.Asr || "15:30", 15) },
     { name: "Maghrib", azan: timings?.Maghrib || "18:22", jamaat: plusMinutes(timings?.Maghrib || "18:22", 5) },
     { name: "Isha", azan: timings?.Isha || "19:45", jamaat: plusMinutes(timings?.Isha || "19:45", 15) },
     { name: "Jummah", azan: "13:00", jamaat: "13:30" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24 w-full min-h-screen relative overflow-hidden bg-slate-50"
    >
      {/* Top Section - Purple/Pink gradient with Mosque Silhouette */}
      <div className="relative pt-12 pb-24 px-4 w-full text-white bg-gradient-to-b from-[#8B2C50] to-[#5C1D36] rounded-b-[40px] shadow-lg">
        {/* Decorative Mosque Silhouette (approximate with CSS/SVG) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center mt-4">
          <div className="text-[42px] font-black tracking-tight drop-shadow-md leading-none mb-2" dir="ltr">
            {format(time, "hh:mm:ss a")}
          </div>
          <div className="text-[16px] font-medium opacity-90 drop-shadow-md mb-1" dir="ltr">
            {format(time, "EEEE, d MMM yyyy")}
          </div>
          <div className="text-[16px] font-bold text-pink-200 drop-shadow-md">
            {hDay} {hMonthName} {hYear}
          </div>
        </div>
      </div>

      {/* Main Content Area overlapping the header */}
      <div className="px-4 relative z-20 -mt-12 max-w-lg mx-auto flex flex-col gap-4">
        
        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView("qibla")} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Qibla Finder</span>
          </button>
          
          <button onClick={() => setView("Quran")} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Quran</span>
          </button>
          
          <button onClick={() => setView("calendar")} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <CloudSun className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Weather</span>
          </button>
          
          <button onClick={() => setView("jamat_silent")} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Vibrate className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-700 text-sm">Silent Mode</span>
          </button>
        </div>

        {/* Hajj & Umrah Section */}
        <button onClick={() => setView("Hajj & Umrah")} className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all">
           <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white">
              <Kaaba className="w-6 h-6" />
           </div>
           <span className="font-bold text-slate-800 text-lg tracking-tight">HAJJ & UMRAH SECTION</span>
        </button>

        {/* Prayer Times List */}
        <div className="mt-2">
           <h3 className="text-slate-800 font-bold text-xl mb-3 px-1">Prayer Times</h3>
           <div className="bg-white rounded-3xl p-2 shadow-md border border-slate-100 flex flex-col gap-1">
              {pts.map((p, i) => {
                const alarmSet = settings.prayerAlarmSounds?.[p.name] !== 'off';
                return (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="w-24 font-bold text-slate-700">{p.name}</div>
                  <div className="flex-1 flex justify-center gap-4">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Azan</span>
                        <span className="font-bold text-slate-800">{p.azan}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Jamaat</span>
                        <span className="font-bold text-emerald-600">{p.jamaat}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => setView("prayer")} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all">
                        <Pencil className="w-4 h-4" />
                     </button>
                     <button onClick={() => {
                       setSettings(p => ({
                         ...p,
                         prayerAlarmSounds: {
                           ...(p.prayerAlarmSounds || {}),
                           [p.name]: alarmSet ? 'off' : 'default'
                         }
                       }));
                     }} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all ${alarmSet ? 'bg-pink-100 text-pink-600 hover:bg-pink-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {alarmSet ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                     </button>
                  </div>
                </div>
              )})}
           </div>
        </div>

      </div>
    </motion.div>
  );
}

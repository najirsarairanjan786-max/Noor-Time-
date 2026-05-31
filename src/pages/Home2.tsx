import { motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ViewType } from "../App";
import { useSettings } from "../hooks/useSettings";
import { useData } from "../hooks/useData";
import { useHijriDate } from "../hooks/useHijriDate";
import { Settings } from "lucide-react";

interface Home2Props {
  setView: Dispatch<SetStateAction<ViewType>>;
}

const LED = ({ text, color = 'red', className = 'text-4xl' }: { text: string | number, color?: 'red' | 'green' | 'amber', className?: string }) => {
  let colorClass = 'text-red-500';
  let shadowColor = 'rgba(239, 68, 68, 0.7)';
  if (color === 'green') {
    colorClass = 'text-green-500';
    shadowColor = 'rgba(34, 197, 94, 0.7)';
  } else if (color === 'amber') {
    colorClass = 'text-amber-500';
    shadowColor = 'rgba(245, 158, 11, 0.7)';
  }

  return (
    <div className="bg-[#0f1110] rounded px-1.5 py-0.5 border border-[#1a1c1b] shadow-[inset_0px_2px_4px_rgba(0,0,0,1)] inline-flex items-center justify-center relative overflow-hidden">
      {/* Background segments for realistic look */}
      <span className={`font-digital absolute text-gray-800 ${className} opacity-30 select-none z-0`}>{String(text).replace(/[0-9a-zA-Z]/g, '8')}</span>
      <span className={`font-digital ${colorClass} ${className} z-10 leading-none tracking-widest`} style={{ textShadow: `0 0 5px ${shadowColor}, 0 0 10px ${shadowColor}` }}>
        {text}
      </span>
    </div>
  );
};

export function Home2({ setView }: Home2Props) {
  const { settings } = useSettings();
  const { timings } = useData(settings.location, settings.method ?? 1, settings.school ?? 1);
  const { hijriDate } = useHijriDate();
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDig = (n: number) => n.toString().padStart(2, '0');
  
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateDay = formatDig(time.getDate());
  const dateMonth = formatDig(time.getMonth() + 1);
  const dateYear = time.getFullYear().toString().slice(-2);

  // Hijri info processing
  let hDay = "00";
  let hMonth = "00";
  let hYear = "0000";
  let hMonthName = "ZUL QADA";
  if (hijriDate) {
    hDay = formatDig(hijriDate.day || 1);
    hMonth = formatDig(hijriDate.month?.number || 1);
    hYear = (hijriDate.year || 1443).toString().slice(-2);
    hMonthName = (hijriDate.month?.en || "ZUL QADA").toUpperCase();
  }

  const plusMinutes = (timeString: string, mins: number) => {
    if (!timeString) return "00:00";
    const [h, m] = timeString.split(':').map(Number);
    if(isNaN(h)) return "00:00";
    const date = new Date();
    date.setHours(h, m + mins);
    return `${formatDig(date.getHours())}:${formatDig(date.getMinutes())}`;
  };

  const pts = {
     Fajr: { azan: timings?.Fajr || "04:38", jamaat: plusMinutes(timings?.Fajr || "04:38", 45) },
     Summary: { azan: timings?.Sunrise || "05:22" }, // tulu
     Zuhr: { azan: timings?.Dhuhr || "13:15", jamaat: plusMinutes(timings?.Dhuhr || "13:15", 15) },
     Asr: { azan: timings?.Asr || "15:30", jamaat: plusMinutes(timings?.Asr || "15:30", 5) },
     Magrib: { azan: timings?.Maghrib || "17:50", jamaat: plusMinutes(timings?.Maghrib || "17:50", 5) },
     Isha: { azan: timings?.Isha || "19:25", jamaat: plusMinutes(timings?.Isha || "19:25", 5) },
     Jumah: { azan: "12:45", jamaat: "13:30" }, // manual standard
     Sunset: { azan: timings?.Sunset || "18:00" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      onDoubleClick={() => setView('home')}
      className="pb-0 w-full min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-2 sm:p-4 text-white overflow-hidden"
    >
      <div className="text-xs text-gray-500 absolute top-2 font-sans tracking-widest text-center w-full">DOUBLE-TAP ANYWHERE TO RETURN</div>

      <div className="w-full max-w-[1000px] aspect-[4/3] max-h-[85vh] bg-[#789ca9] border-[12px] sm:border-[20px] border-[#181a1b] rounded-2xl sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 sm:p-4 flex flex-col relative overflow-hidden" 
           style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
        
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2 sm:mb-4 gap-2">
          {/* Top Left Current Time */}
          <div className="bg-[#173a52] rounded-lg p-1.5 flex flex-col items-center border-t border-blue-400/20 shadow-md">
             <div className="flex justify-between w-full text-[10px] sm:text-xs text-blue-200 font-bold px-1 mb-1 shadow-sm">
                <span>DAY</span><span>TIME وقت</span>
             </div>
             <div className="flex gap-2 items-center">
                <LED text={dayName} color="red" className="text-xl sm:text-4xl" />
                <LED text={`${formatDig(time.getHours())}:${formatDig(time.getMinutes())}`} color="red" className="text-3xl sm:text-6xl" />
             </div>
          </div>
          
          {/* Top Center Logo (Decorative) */}
          <div className="hidden sm:flex flex-col items-center justify-center font-serif text-emerald-900 drop-shadow-md">
            <h1 className="text-3xl font-bold font-arabic mb-1">لا إله إلا الله محمد رسول الله</h1>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Al-Masjid Al-Aqsa</p>
          </div>
          
          <div className="flex flex-col items-center">
            {/* Some mosque vector icon or decor */}
            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-emerald-900/50 shadow-inner">
               <Settings className="text-emerald-900 w-6 h-6 sm:w-10 sm:h-10 opacity-70" />
            </div>
             <span className="text-[10px] text-emerald-900 font-bold mt-1">جَمَاعَت</span>
          </div>
        </div>

        <div className="flex flex-1 gap-2 sm:gap-4 overflow-hidden">
           
           {/* Left Column (Info) */}
           <div className="w-5/12 flex flex-col gap-2 relative">
             
             {/* JAMAA'AT & AZAN Now Box */}
             <div className="bg-[#e45149] rounded p-1 mb-2">
               <div className="bg-[#173a52] rounded p-1 sm:p-2 flex flex-col gap-1 items-center justify-center">
                  <div className="flex justify-between w-full text-[8px] sm:text-xs font-bold text-blue-200 px-1 uppercase drop-shadow-sm">
                     <span>JAMA'AT جَمَاعَت</span> <span>AZAN آذَان</span>
                  </div>
                  <LED text={`${pts.Zuhr.jamaat}`} color="green" className="text-4xl sm:text-7xl mb-1" />
                  <div className="flex gap-2 w-full justify-between items-center text-white font-bold drop-shadow">
                     <span className="text-sm sm:text-xl uppercase drop-shadow-md text-red-100">ZUHR</span>
                     <LED text={`${pts.Zuhr.azan}`} color="red" className="text-2xl sm:text-4xl" />
                  </div>
               </div>
             </div>

             {/* Temp */}
             <div className="bg-[#173a52] rounded p-1.5 flex items-center gap-2">
                <span className="text-[10px] sm:text-sm font-bold text-blue-200">TEMP.</span>
                <LED text="36°C" color="red" className="text-xl sm:text-3xl" />
             </div>

             {/* Info Box */}
             <div className="bg-[#173a52] rounded p-1.5 flex flex-col gap-1">
                <div className="flex justify-between items-center px-1">
                   <span className="text-[10px] font-bold text-blue-200">INFO</span>
                   <LED text="ZAWAL" color="red" className="text-lg sm:text-2xl" />
                </div>
                <div className="flex justify-between text-[8px] sm:text-[10px] text-blue-200 font-bold px-1 mt-1">
                   <span>START اول</span><span>END اخر</span>
                </div>
                <div className="flex justify-between gap-1">
                   <LED text="12:14" color="red" className="text-xl sm:text-3xl flex-1" />
                   <LED text="12:34" color="green" className="text-xl sm:text-3xl flex-1" />
                </div>
             </div>

             {/* Dates Box */}
             <div className="bg-[#173a52] rounded p-1.5 flex flex-col gap-1.5 mt-auto">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] sm:text-xs font-bold text-blue-200 w-12">DATE</span>
                   <div className="flex gap-1 flex-1">
                     <LED text={dateDay} color="red" className="text-lg sm:text-3xl flex-1" />
                     <LED text={dateMonth} color="red" className="text-lg sm:text-3xl flex-1" />
                     <LED text={dateYear} color="red" className="text-lg sm:text-3xl flex-1" />
                   </div>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] sm:text-xs font-bold text-blue-200 w-12 text-shadow-sm">HIJRI</span>
                   <div className="flex gap-1 flex-1">
                     <LED text={hDay} color="green" className="text-lg sm:text-3xl flex-1" />
                     <LED text={hMonth} color="green" className="text-lg sm:text-3xl flex-1" />
                     <LED text={hYear} color="green" className="text-lg sm:text-3xl flex-1" />
                   </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-[10px] sm:text-xs font-bold text-blue-200 w-12">MONTH</span>
                   <LED text={hMonthName} color="red" className="text-lg sm:text-2xl flex-1 text-center" />
                </div>
             </div>
           </div>

           {/* Right Column (Timetable) */}
           <div className="w-7/12 flex flex-col">
              <div className="w-full bg-[#173a52] rounded flex justify-between p-1 text-[8px] sm:text-[10px] font-bold text-blue-200 uppercase mb-1">
                 <span>Prayer</span><span>AZAN</span><span>JAMA'AT</span>
              </div>
              
              <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 justify-between">
                {[
                  { name: 'FAJR', u: 'فَجَر', a: pts.Fajr.azan, j: pts.Fajr.jamaat },
                  { name: 'ZUHAR', u: 'ظُهَر', a: pts.Zuhr.azan, j: pts.Zuhr.jamaat },
                  { name: 'ASR', u: 'عَصَر', a: pts.Asr.azan, j: pts.Asr.jamaat },
                  { name: 'MAGRIB', u: 'مَغْرِب', a: pts.Magrib.azan, j: pts.Magrib.jamaat },
                  { name: 'ISHA\'', u: 'عِشَاء', a: pts.Isha.azan, j: pts.Isha.jamaat },
                  { name: 'JUM\'AH', u: 'جُمُعَه', a: pts.Jumah.azan, j: pts.Jumah.jamaat },
                ].map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[#173a52] rounded p-1 sm:p-2 border-b-2 border-[#122e41]">
                     <div className="w-16 sm:w-24 text-white font-bold drop-shadow flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                        <span className="text-[10px] sm:text-sm">{p.name}</span>
                        <span className="text-[8px] sm:text-[10px] text-blue-200 opacity-80 arabic-text hidden sm:block">{p.u}</span>
                     </div>
                     <LED text={p.a} color="green" className="text-xl sm:text-4xl" />
                     <LED text={p.j} color="red" className="text-xl sm:text-4xl" />
                  </div>
                ))}
              </div>

              {/* Bottom Extra Details (Tulu/Zawal etc) */}
              <div className="flex gap-2 mt-2">
                 <div className="flex-1 bg-[#173a52] rounded p-1 sm:p-2 flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <span>TULU START</span><LED text={pts.Summary.azan} color="red" className="text-sm sm:text-xl" />
                    </div>
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <span>ZAWAL END</span><LED text="12:34" color="red" className="text-sm sm:text-xl" />
                    </div>
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <span>GURUB END</span><LED text={pts.Sunset.azan} color="red" className="text-sm sm:text-xl" />
                    </div>
                 </div>
                 
                 <div className="flex-1 bg-[#173a52] rounded p-1 sm:p-2 flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <LED text="03:38" color="red" className="text-sm sm:text-xl" /><span>SAHR</span>
                    </div>
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <LED text={pts.Magrib.azan} color="green" className="text-sm sm:text-xl" /><span>IFTAR</span>
                    </div>
                    <div className="flex justify-between text-[8px] sm:text-xs text-white font-bold items-center">
                       <LED text="01:30" color="red" className="text-sm sm:text-xl" /><span className="text-[8px] sm:text-[10px] leading-tight">TOMORROW</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

        {/* Footer info (Website / Board Maker) */}
        <div className="absolute bottom-1 right-2 left-2 flex justify-between px-2 text-[8px] sm:text-[10px] text-emerald-900 font-bold opacity-60">
           <span>MADE BY ALQURAN APP</span>
           <span>AL-KARAM</span>
        </div>
      </div>
    </motion.div>
  );
}


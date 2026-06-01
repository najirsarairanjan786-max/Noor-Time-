import { motion } from "motion/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ViewType } from "../App";
import { useSettings } from "../hooks/useSettings";
import { useData } from "../hooks/useData";
import { useHijriDate } from "../hooks/useHijriDate";
import { Moon, Sun } from "lucide-react";

interface Home2Props {
  setView: Dispatch<SetStateAction<ViewType>>;
}

const LED = ({ text, color = 'red', className = 'text-4xl' }: { text: string | number, color?: 'red' | 'green' | 'amber', className?: string }) => {
  let colorClass = 'text-[#ff1111]';
  let shadowColor = 'rgba(255, 0, 0, 0.8)';
  
  if (color === 'green') {
    colorClass = 'text-[#00ff22]';
    shadowColor = 'rgba(0, 255, 0, 0.8)';
  } else if (color === 'amber') {
    colorClass = 'text-[#ff9900]';
    shadowColor = 'rgba(255, 153, 0, 0.8)';
  }

  return (
    <div className="bg-[#0a0a0a] rounded px-1.5 py-0.5 border-2 border-[#111] shadow-[inset_0_0_8px_rgba(0,0,0,1)] inline-flex items-center justify-center relative overflow-hidden">
      <span className={`font-digital absolute text-[#222] ${className} select-none z-0`}>
        {String(text).replace(/[0-9a-zA-Z]/g, '8')}
      </span>
      <span className={`font-digital ${colorClass} ${className} z-10 leading-none tracking-widest`} 
            style={{ textShadow: `0 0 5px ${shadowColor}, 0 0 10px ${shadowColor}` }}>
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
  const century = time.getFullYear().toString().slice(0, 2);

  let hDay = "00";
  let hMonth = "00";
  let hYear = "00";
  let hCentury = "14";
  let hMonthName = "ZUL QADA";
  if (hijriDate) {
    hDay = formatDig(hijriDate.day || 1);
    hMonth = formatDig(hijriDate.month?.number || 1);
    hYear = (hijriDate.year || 1443).toString().slice(-2);
    hCentury = (hijriDate.year || 1443).toString().slice(0, 2);
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
     Summary: { azan: timings?.Sunrise || "05:22" },
     Zuhr: { azan: timings?.Dhuhr || "13:15", jamaat: plusMinutes(timings?.Dhuhr || "13:15", 15) },
     Asr: { azan: timings?.Asr || "15:30", jamaat: plusMinutes(timings?.Asr || "15:30", 5) },
     Magrib: { azan: timings?.Maghrib || "17:50", jamaat: plusMinutes(timings?.Maghrib || "17:50", 5) },
     Isha: { azan: timings?.Isha || "19:25", jamaat: plusMinutes(timings?.Isha || "19:25", 5) },
     Jumah: { azan: "12:45", jamaat: "13:30" },
     Sunset: { azan: timings?.Sunset || "18:00" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      onDoubleClick={() => setView('home')}
      className="w-full min-h-screen bg-[#111] flex flex-col items-center justify-center p-2 sm:p-4 text-white overflow-hidden relative"
    >
      <div className="absolute top-4 w-full text-center text-white/30 text-xs font-sans tracking-widest pointer-events-none">
        DOUBLE-TAP TO RETURN
      </div>
      
      <div className="w-full max-w-[1100px] aspect-[4/3] bg-[#789ea8] border-[16px] border-[#181a1b] rounded-2xl sm:rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-2 sm:p-4 flex flex-col overflow-hidden select-none"
           style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
        
        <div className="flex gap-3 sm:gap-4 w-full h-full relative z-10">
          
          {/* Left Column */}
          <div className="w-[36%] flex flex-col gap-2 h-full justify-between">
             
             {/* Box 1: Day */}
             <div className="bg-[#1b4365] rounded-xl p-2 pb-1 shadow-lg border-2 border-[#122e41]">
                <div className="flex justify-center items-center px-1 mb-1 gap-1">
                   <LED text={dayName} color="red" className="text-2xl sm:text-4xl" />
                </div>
                <div className="flex justify-center px-2 text-[8px] sm:text-[10px] font-bold text-white tracking-wider mt-1">
                   <span>DAY</span>
                </div>
             </div>

             {/* Box 2: JAMA'AT Next */}
             <div className="bg-[#1b4365] rounded-xl p-2 pt-1 shadow-lg border-2 border-[#122e41]">
                <div className="flex justify-between items-start">
                   <div className="flex flex-col text-[8px] sm:text-[10px] font-bold text-white mt-1">
                      <span>JAMA'AT</span>
                      <span className="font-arabic font-normal text-xs sm:text-sm">جَمَاعَت</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <div className="flex justify-center w-full mb-1">
                          <LED text={pts.Zuhr.jamaat} color="green" className="text-3xl sm:text-5xl" />
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                        AZAN <span className="font-arabic font-normal text-xs sm:text-sm ml-0.5">آذَان</span>
                      </span>
                   </div>
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-1.5">
                   <LED text="ZUHR" color="red" className="text-xl sm:text-3xl" />
                   <LED text={pts.Zuhr.azan} color="amber" className="text-xl sm:text-3xl" />
                </div>
             </div>

             {/* Box 3: TEMP */}
             <div className="bg-[#1b4365] rounded-xl p-2 shadow-lg border-2 border-[#122e41] flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] font-bold text-white tracking-wider px-1">TEMP.</span>
                <LED text="36°C" color="red" className="text-xl sm:text-3xl" />
                <div className="flex gap-1 opacity-80 pl-2">
                   <div className="w-4 h-4 bg-green-500/20 border-2 border-green-400 rounded-sm"></div>
                   <div className="w-4 h-4 bg-white/10 border-2 border-white/50 rounded-sm"></div>
                   <div className="w-4 h-4 border-2 border-red-400/50 flex items-center justify-center rounded-sm">
                      <div className="w-2 h-2 bg-red-500/50 rotate-45"></div>
                   </div>
                </div>
             </div>

             {/* Box 4: INFO / ZAWAL */}
             <div className="bg-[#1b4365] rounded-xl p-2 pb-1 shadow-lg border-2 border-[#122e41]">
                <div className="flex justify-between items-center px-1 mb-1">
                   <span className="text-[8px] sm:text-[10px] font-bold text-white tracking-wider bg-red-600/80 px-1 py-0.5 rounded">INFO</span>
                   <LED text="ZAWAL" color="red" className="text-xl sm:text-3xl" />
                </div>
                <div className="flex justify-between text-[6px] sm:text-[8px] font-bold text-white px-6">
                   <span>START <span className="font-arabic text-[10px] font-normal">اول</span></span>
                   <span>END <span className="font-arabic text-[10px] font-normal">اخر</span></span>
                </div>
                <div className="flex justify-between gap-2 mt-0.5">
                   <LED text="12:14" color="red" className="text-xl sm:text-3xl flex-1 text-center" />
                   <LED text="12:34" color="green" className="text-xl sm:text-3xl flex-1 text-center" />
                </div>
             </div>

             {/* Box 5: DATE & HIJRI */}
             <div className="bg-[#1b4365] rounded-xl p-2 py-3 shadow-lg border-2 border-[#122e41] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                   <span className="text-[8px] sm:text-[10px] font-bold text-white w-10">DATE</span>
                   <div className="flex flex-1 justify-between gap-1 pl-2">
                      <LED text={dateDay} color="red" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={dateMonth} color="red" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={century} color="red" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={dateYear} color="red" className="text-lg sm:text-2xl flex-1 text-center" />
                   </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                   <span className="text-[8px] sm:text-[10px] font-bold text-white w-10">HIJRI</span>
                   <div className="flex flex-1 justify-between gap-1 pl-2">
                      <LED text={hDay} color="green" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={hMonth} color="green" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={hCentury} color="green" className="text-lg sm:text-2xl flex-1 text-center" />
                      <LED text={hYear} color="green" className="text-lg sm:text-2xl flex-1 text-center" />
                   </div>
                </div>
                <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-white/5">
                   <span className="text-[8px] sm:text-[10px] font-bold text-white w-10">MONTH</span>
                   <LED text={hMonthName.length > 8 ? hMonthName.substring(0,8) : hMonthName.padEnd(8, ' ')} color="red" className="text-lg sm:text-2xl flex-[3] ml-1 text-center uppercase" />
                </div>
             </div>
          </div>

          {/* Right Column */}
          <div className="w-[64%] flex flex-col h-full pl-0 relative">
             
             {/* Header decorative row */}
             <div className="absolute -top-1 left-0 right-0 flex justify-center items-center h-14 pointer-events-none gap-6 sm:gap-12 z-20">
               {/* Left icon circle */}
               <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#3eb2cf] rounded-full border-[3px] border-[#aadcda] shadow-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
               </div>
               
               {/* Center text */}
               <div className="flex flex-col items-center mt-2">
                  <h1 className="text-white font-arabic text-2xl sm:text-4xl font-bold drop-shadow-md pb-1" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                     لا إله إلا الله محمد رسول الله
                  </h1>
               </div>

               {/* Right icon circle */}
               <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#3eb2cf] rounded-full border-[3px] border-[#aadcda] shadow-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
               </div>
             </div>

             {/* Timetable Header */}
             <div className="flex justify-around items-end pt-12 sm:pt-16 pb-1 text-white font-bold drop-shadow text-[10px] sm:text-xs uppercase">
                <span className="ml-[15%]">AZAN <span className="font-arabic font-normal ml-0.5">آذَان</span></span>
                <span className="mr-[8%]">JAMA'AT <span className="font-arabic font-normal ml-0.5">جَمَاعَت</span></span>
             </div>

             {/* Timetable List */}
             <div className="flex flex-col gap-1 sm:gap-1.5 flex-grow">
               {[
                  { name: 'FAJR', u: 'فَجَر', a: pts.Fajr.azan, j: pts.Fajr.jamaat },
                  { name: 'ZUHAR', u: 'ظُهَر', a: pts.Zuhr.azan, j: pts.Zuhr.jamaat },
                  { name: 'ASR', u: 'عَصَر', a: pts.Asr.azan, j: pts.Asr.jamaat },
                  { name: 'MAGRIB', u: 'مَغْرِب', a: pts.Magrib.azan, j: pts.Magrib.jamaat },
                  { name: 'ISHA\'', u: 'عِشَاء', a: pts.Isha.azan, j: pts.Isha.jamaat },
                  { name: 'JUM\'AH', u: 'جُمُعَه', a: pts.Jumah.azan, j: pts.Jumah.jamaat },
                ].map((p, i) => (
                  <div key={i} className="flex gap-1.5 flex-1 max-h-[52px]">
                     {/* Left Half (Name + Azan) */}
                     <div className="flex-1 bg-[#1b4365] rounded-l-full rounded-r flex items-center justify-between p-1 px-2 border-2 border-[#122e41] shadow-md">
                        <span className="text-white font-bold text-xs sm:text-sm w-12 sm:w-14 text-center pl-1">{p.name}</span>
                        <LED text={p.a} color="green" className="text-2xl sm:text-4xl" />
                     </div>
                     {/* Right Half (Jama'at + Arabic Name) */}
                     <div className="flex-1 bg-[#1b4365] rounded-r-full rounded-l flex items-center justify-between p-1 px-2 border-2 border-[#122e41] shadow-md">
                        <LED text={p.j} color="red" className="text-2xl sm:text-4xl" />
                        <span className="text-white font-arabic text-sm sm:text-xl font-bold w-12 sm:w-16 text-center pr-1 translate-y-[2px]">{p.u}</span>
                     </div>
                  </div>
                ))}
             </div>

             {/* Bottom 2 boxes */}
             <div className="flex gap-2 mt-1 sm:mt-2 h-16 sm:h-20">
                {/* Tulu/Zawal Box */}
                <div className="flex-1 bg-[#1b4365] rounded-xl p-1.5 px-3 flex flex-col justify-between border-2 border-[#122e41] shadow-md">
                   <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-[8px] sm:text-[10px] w-16">TULU <span className="text-[6px] sm:text-[8px]">START</span></span>
                      <LED text={pts.Summary.azan} color="red" className="text-lg sm:text-2xl" />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-[8px] sm:text-[10px] w-16">ZAWAL <span className="text-[6px] sm:text-[8px]">END</span></span>
                      <LED text="12:34" color="red" className="text-lg sm:text-2xl" />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-[8px] sm:text-[10px] w-16">GURUB <span className="text-[6px] sm:text-[8px]">END</span></span>
                      <LED text={pts.Sunset.azan} color="red" className="text-lg sm:text-2xl" />
                   </div>
                </div>

                {/* Sahr/Iftar Box */}
                <div className="flex-1 bg-[#1b4365] rounded-xl p-1.5 px-3 flex flex-col justify-between border-2 border-[#122e41] shadow-md">
                   <div className="flex justify-between items-center">
                      <LED text="03:38" color="red" className="text-lg sm:text-2xl" />
                      <span className="text-white font-bold text-[8px] sm:text-[10px]">SAHR</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <LED text={pts.Magrib.azan} color="green" className="text-lg sm:text-2xl" />
                      <span className="text-white font-bold text-[8px] sm:text-[10px]">IFTAR</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <LED text="01:30" color="red" className="text-lg sm:text-2xl" />
                      <span className="text-white font-bold text-[6px] sm:text-[8px] leading-tight text-right uppercase w-12 sm:w-16">TOMORROW</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Sign Footer */}
       <div className="absolute bottom-1 left-2 right-2 flex justify-between items-end pb-0 px-2 sm:px-4 z-20">
           <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-white/90 px-1 py-0.5 rounded-sm text-[6px] sm:text-[8px] text-teal-800 font-bold border border-black/30">ALSEHAR.COM</div>
              <div className="bg-green-700/90 px-1 py-0.5 rounded-sm text-[6px] sm:text-[8px] text-white font-bold border border-black/30">AL-KARAM</div>
           </div>
           <span className="text-white font-arabic text-[10px] sm:text-xs opacity-90 drop-shadow shadow-black/80">
              مرکزی جامع مسجد محمدیہ امپورہ ہاؤسنگ کالونی
           </span>
       </div>

      </div>
    </motion.div>
  );
}



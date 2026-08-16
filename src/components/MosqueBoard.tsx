import React, { useState, useEffect } from 'react';
import { format, parse, isAfter, addDays, differenceInSeconds, startOfDay } from 'date-fns';
import { useLocalStorage, useInterval } from 'usehooks-ts';
import { PrayerTimings } from '../lib/api';
import { Settings, X } from 'lucide-react';
import { useHijriDate } from '../hooks/useHijriDate';
import { useSettings } from '../hooks/useSettings';
import { cn } from '../lib/utils';

interface MosqueBoardProps {
  timings: PrayerTimings | null;
}

export function MosqueBoard({ timings }: MosqueBoardProps) {
  const { settings } = useSettings();
  const { hijriDate } = useHijriDate();
  const [now, setNow] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Mosque settings
  const [jamaatOffsets, setJamaatOffsets] = useLocalStorage('mosque_jamaat_offsets', {
    Fajr: 30, // minutes after azan
    Dhuhr: 15,
    Asr: 15,
    Maghrib: 10,
    Isha: 15,
  });
  const [jummaTime, setJummaTime] = useLocalStorage('mosque_jumma_time', '13:30');
  const [masjidName, setMasjidName] = useLocalStorage('mosque_name', 'Masjid Noor');

  useInterval(() => {
    setNow(new Date());
  }, 1000);

  if (!timings) return null;

  const parseTime = (timeStr: string) => parse(timeStr.split(" ")[0], "HH:mm", new Date());
  
  const prayers = [
    { id: 'Fajr', name: 'FAJR', ar: 'فجر', azan: parseTime(timings.Fajr) },
    { id: 'Dhuhr', name: 'ZUHAR', ar: 'ظہر', azan: parseTime(timings.Dhuhr) },
    { id: 'Asr', name: 'ASR', ar: 'عصر', azan: parseTime(timings.Asr) },
    { id: 'Maghrib', name: 'MAGRIB', ar: 'مغرب', azan: parseTime(timings.Maghrib) },
    { id: 'Isha', name: 'ISHA', ar: 'عشاء', azan: parseTime(timings.Isha) },
  ];

  const displayPrayers = prayers.map(p => {
    const offset = jamaatOffsets[p.id as keyof typeof jamaatOffsets] || 0;
    const jamaat = new Date(p.azan.getTime() + offset * 60000);
    return { ...p, jamaat };
  });

  let nextPrayer = displayPrayers[0];
  let isNextDay = false;
  for (const prayer of displayPrayers) {
    if (isAfter(prayer.azan, now)) {
      nextPrayer = prayer;
      break;
    }
  }
  if (isAfter(now, displayPrayers[displayPrayers.length - 1].azan)) {
    nextPrayer = displayPrayers[0];
    isNextDay = true;
  }

  let nextPrayerTime = nextPrayer.azan;
  if (isNextDay) {
    nextPrayerTime = addDays(nextPrayerTime, 1);
  }

  const isRamadan = hijriDate?.month.number === 9;
  const tulu = parseTime(timings.Sunrise);
  const gurub = parseTime(timings.Sunset);
  const zawal = new Date(parseTime(timings.Dhuhr).getTime() - 5 * 60000);
  const sehri = timings.Imsak ? parseTime(timings.Imsak) : new Date(parseTime(timings.Fajr).getTime() - 10 * 60000);
  
  // LED text style component
  const LEDText = ({ text, color = "red", size = "text-xl", shadow = true }: { text: string | number, color?: "red" | "green", size?: string, shadow?: boolean }) => (
    <span className={cn(
      "font-mono font-bold tracking-widest tabular-nums",
      size,
      color === "red" ? "text-red-500" : "text-green-500"
    )} style={shadow ? { textShadow: `0 0 10px ${color === "red" ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.7)'}` } : {}}>
      {text}
    </span>
  );

  return (
    <div className="w-full max-w-lg mx-auto bg-[#e5d9c5] rounded-[16px] shadow-2xl border-[16px] border-[#1a1a1a] relative overflow-hidden font-sans mb-6">
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b5a2b 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
      
      {/* Settings Button */}
      <button onClick={() => setIsSettingsOpen(true)} className="absolute top-2 right-2 text-gray-800 hover:text-black z-20 transition-colors p-1 bg-white/50 rounded-full">
        <Settings className="w-4 h-4" />
      </button>

      {/* Header Name */}
      <div className="text-center pt-2 pb-2 relative z-10">
        <h2 className="text-[#3b2a1a] font-black text-xl uppercase tracking-widest">
          {masjidName}
        </h2>
        <div className="text-[#3b2a1a] font-arabic text-2xl mt-1">بسم الله الرحمن الرحيم</div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 relative z-10">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-2">
          
          {/* Time & Weather */}
          <div className="bg-[#111] rounded-lg p-2 border border-black shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start mb-1">
              <span className="text-white text-[10px] font-bold tracking-wider">TIME</span>
              <span className="text-white text-[10px] font-arabic">وقت</span>
            </div>
            <div className="flex justify-center my-1">
              <LEDText text={format(now, 'HH:mm:ss')} size="text-3xl" />
            </div>
            <div className="flex justify-between items-end mt-1">
              <LEDText text="28°C" size="text-sm" />
              <LEDText text={format(now, 'EEEE').toUpperCase()} size="text-sm" />
            </div>
          </div>

          {/* Date info blocks */}
          <div className="flex flex-col gap-1">
            <div className="bg-[#111] rounded p-1 border border-black flex items-center justify-between">
              <span className="text-white text-[9px] font-bold w-12">MONTH</span>
              <LEDText text={hijriDate?.month.en || "-"} color="green" size="text-sm" />
            </div>
            <div className="bg-[#111] rounded p-1 border border-black flex items-center justify-between">
              <span className="text-white text-[9px] font-bold w-12">HIJRI</span>
              <LEDText text={hijriDate ? `${hijriDate.day} ${hijriDate.month.number} ${hijriDate.year}` : "-"} size="text-sm" />
            </div>
            <div className="bg-[#111] rounded p-1 border border-black flex items-center justify-between">
              <span className="text-white text-[9px] font-bold w-12">DATE</span>
              <LEDText text={format(now, 'dd MM yyyy')} size="text-sm" />
            </div>
          </div>

          {/* Current / Next Prayer Highlight box */}
          <div className="bg-[#111] rounded-lg p-2 border border-black shadow-[inset_0_0_10px_rgba(0,0,0,1)] flex flex-col items-center justify-center mt-1">
            <div className="flex gap-4 mb-1">
              <span className="text-white text-[9px] font-bold">START</span>
              <span className="text-white text-[9px] font-bold">END</span>
            </div>
            <LEDText text={nextPrayer.name} color="green" size="text-xl" />
          </div>

          {/* Tulu, Zawal, Gurub */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="bg-[#111] rounded p-1 flex justify-between items-center border border-black">
              <div className="flex flex-col"><span className="text-white text-[10px] font-bold leading-none">TULU'</span><span className="text-white text-[8px] font-arabic leading-none mt-0.5">طلوع</span></div>
              <span className="text-white text-[8px]">start</span>
              <LEDText text={format(tulu, 'HH:mm')} size="text-sm" />
            </div>
            <div className="bg-[#111] rounded p-1 flex justify-between items-center border border-black">
              <div className="flex flex-col"><span className="text-white text-[10px] font-bold leading-none">ZAWAL</span><span className="text-white text-[8px] font-arabic leading-none mt-0.5">زوال</span></div>
              <span className="text-white text-[8px]">end</span>
              <LEDText text={format(zawal, 'HH:mm')} size="text-sm" />
            </div>
            <div className="bg-[#111] rounded p-1 flex justify-between items-center border border-black">
              <div className="flex flex-col"><span className="text-white text-[10px] font-bold leading-none">GURUB</span><span className="text-white text-[8px] font-arabic leading-none mt-0.5">غروب</span></div>
              <span className="text-white text-[8px]">end</span>
              <LEDText text={format(gurub, 'HH:mm')} size="text-sm" />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-1">
          
          {/* Top highlight Jamaat / Azan */}
          <div className="bg-[#111] rounded-lg p-2 border border-black flex flex-col mb-1 shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-end mb-1">
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-bold">JAMA'AT</span>
                <span className="text-white text-[10px] font-arabic">جماعت</span>
              </div>
              <LEDText text={format(nextPrayer.jamaat, 'HH:mm')} size="text-2xl" />
            </div>
            <div className="flex justify-between items-end mt-1">
              <LEDText text={nextPrayer.name} color="green" size="text-lg" />
              <div className="flex flex-col items-end">
                <span className="text-white text-[10px] font-bold">AZAN أذان</span>
                <LEDText text={format(nextPrayer.azan, 'HH:mm')} size="text-lg" />
              </div>
            </div>
          </div>

          {/* Table headers */}
          <div className="flex justify-between px-1">
            <span className="text-[#3b2a1a] text-[9px] font-bold">PRAYER</span>
            <span className="text-[#3b2a1a] text-[9px] font-bold w-10 text-center">AZAN</span>
            <span className="text-[#3b2a1a] text-[9px] font-bold w-12 text-right">JAMA'AT</span>
          </div>

          {/* Prayers List */}
          {displayPrayers.map(p => (
            <div key={p.id} className="bg-[#111] rounded p-1.5 flex justify-between items-center border border-black">
              <div className="flex flex-col w-12">
                <span className="text-white text-[10px] font-bold leading-none">{p.name}</span>
                <span className="text-white text-[8px] font-arabic mt-0.5 leading-none">{p.ar}</span>
              </div>
              <div className="w-10 text-center">
                <LEDText text={format(p.azan, 'HH:mm')} color="green" size="text-sm" />
              </div>
              <div className="w-12 text-right">
                <LEDText text={format(p.jamaat, 'HH:mm')} size="text-sm" />
              </div>
            </div>
          ))}

          {/* Jum'ah */}
          <div className="bg-[#111] rounded p-1.5 flex justify-between items-center border border-black mt-1">
            <div className="flex flex-col w-12">
              <span className="text-white text-[10px] font-bold leading-none">JUM'AH</span>
              <span className="text-white text-[8px] font-arabic mt-0.5 leading-none">جمعہ</span>
            </div>
            <div className="w-10 text-center">
              <LEDText text={jummaTime} color="green" size="text-sm" />
            </div>
            <div className="w-12 text-right">
              <LEDText text={jummaTime} size="text-sm" />
            </div>
          </div>

          {/* Sahr / Iftar - Conditional or always present? */}
          {isRamadan && (
            <>
              <div className="bg-[#111] rounded p-1.5 flex justify-between items-center border border-black mt-1">
                <div className="flex flex-col flex-1">
                  <span className="text-white text-[10px] font-bold leading-none">SAHR</span>
                  <span className="text-white text-[8px] font-arabic mt-0.5 leading-none">سحر</span>
                </div>
                <LEDText text={format(sehri, 'HH:mm')} size="text-sm" />
              </div>
              <div className="bg-[#111] rounded p-1.5 flex justify-between items-center border border-black mt-1">
                <div className="flex flex-col flex-1">
                  <span className="text-white text-[10px] font-bold leading-none">IFTAR</span>
                  <span className="text-white text-[8px] font-arabic mt-0.5 leading-none">افطار</span>
                </div>
                <LEDText text={format(gurub, 'HH:mm')} size="text-sm" />
              </div>
            </>
          )}

        </div>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/95 z-50 p-4 overflow-y-auto font-sans flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Board Settings</h3>
            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Masjid Name</label>
              <input 
                type="text" 
                value={masjidName} 
                onChange={e => setMasjidName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Jum'ah Jamaat Time (HH:mm)</label>
              <input 
                type="time" 
                value={jummaTime} 
                onChange={e => setJummaTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-white font-bold text-sm mb-3">Jamaat Offsets (Minutes after Azan)</h4>
              {prayers.map(p => (
                <div key={p.id} className="flex justify-between items-center mb-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-300 font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      min="0"
                      max="120"
                      value={jamaatOffsets[p.id as keyof typeof jamaatOffsets] || 0}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setJamaatOffsets(prev => ({ ...prev, [p.id]: val }));
                      }}
                      className="w-16 bg-black border border-gray-700 rounded px-2 py-1.5 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-500 text-xs">min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-4 mt-6 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
          >
            Save & Close
          </button>
        </div>
      )}
    </div>
  );
}

import { PrayerTimings } from '../lib/api';
import { Volume2, VolumeX, Compass, BookOpen, MapPin, Search, Pencil, Check } from 'lucide-react';
import { parse, format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '../lib/utils';
import { useSettings } from '../hooks/useSettings';
import { useLocalStorage } from 'usehooks-ts';
import { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | string;

export function PrayerTimesList({ timings, setView }: { timings: PrayerTimings | null, setView?: Dispatch<SetStateAction<ViewType>> }) {
  const { settings, setSettings, requestLocation } = useSettings();
  const schoolName = settings.school === 1 ? ' \u2014 Hanafi' : '';
  const [alarms, setAlarms] = useLocalStorage<Record<string, boolean>>('islamic-alarms-v3', {
    'Fajr': true, 'Zuhr': true, 'Asr \u2014 Hanafi': true, 'Maghrib': true, 'Isha \u2014 Hanafi': true,
    'Asr': true, 'Isha': true, 'Jumma': true
  });
  const [now, setNow] = useState(new Date());
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timings) {
    return (
      <div className="space-y-4 mt-8 w-full max-w-md mx-auto">
        <div className="h-32 bg-emerald-800/30 animate-pulse rounded-2xl"></div>
        <div className="h-64 bg-emerald-800/30 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  const prayers = [
    { name: 'Fajr', time: settings.customTimings?.['Fajr'] || timings.Fajr },
    { name: 'Zuhr', time: settings.customTimings?.['Zuhr'] || timings.Dhuhr },
    { name: `Asr${schoolName}`, time: settings.customTimings?.[`Asr${schoolName}`] || timings.Asr },
    { name: 'Maghrib', time: settings.customTimings?.['Maghrib'] || timings.Maghrib },
    { name: `Isha${schoolName}`, time: settings.customTimings?.[`Isha${schoolName}`] || timings.Isha },
    { name: 'Jumma', time: settings.customTimings?.['Jumma'] || timings.Dhuhr },
  ];

  let nextPrayerIndex = prayers.findIndex(p => {
    const prayerTime = parse(p.time.split(' ')[0], 'HH:mm', now);
    return isAfter(prayerTime, now);
  });
  
  if (nextPrayerIndex === -1) nextPrayerIndex = 0;

  const toggleAlarm = (name: string) => {
    setAlarms(prev => ({ ...prev, [name]: !prev[name] }));
    if (settings.silentMode) {
      setSettings(prev => ({ ...prev, silentMode: false }));
    }
  };

  const handleGlobalSilentToggle = () => {
    const newSilentState = !settings.silentMode;
    setSettings(p => ({ ...p, silentMode: newSilentState }));
    
    setAlarms(prev => {
      const updated = { ...prev };
      prayers.forEach(p => {
        updated[p.name] = !newSilentState;
      });
      return updated;
    });
  };

  const handleEditClick = (name: string, currentTime: string) => {
    setEditingPrayer(name);
    setEditingTime(currentTime.split(' ')[0]);
  };

  const handleSaveEdit = (name: string) => {
    if (editingTime) {
      setSettings(prev => ({
        ...prev,
        customTimings: {
          ...(prev.customTimings || {}),
          [name]: editingTime
        }
      }));
    }
    setEditingPrayer(null);
  };

  const nextPrayerName = prayers[nextPrayerIndex].name.replace(' \u2014 Hanafi', '');
  const nextPrayerTimeObj = parse(prayers[nextPrayerIndex].time.split(' ')[0], 'HH:mm', now);
  if (nextPrayerIndex === 0 && now.getHours() > 12) {
    nextPrayerTimeObj.setDate(nextPrayerTimeObj.getDate() + 1);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Dashboard Top Widget */}
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 pr-1 mb-3 flex items-center justify-between relative mt-[-2.5rem] min-h-[7rem]">
        
        {/* Next Prayer Circular Progress */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="56" cy="56" r="50" stroke="#f1f5f9" strokeWidth="8" fill="none" />
            <circle
              cx="56" cy="56" r="50"
              stroke="#64748b" strokeWidth="8" fill="none"
              strokeDasharray="314" strokeDashoffset="120"
              className="text-slate-400"
            />
          </svg>
          <div className="flex flex-col items-center justify-center text-slate-800 z-10 w-full">
            <span className="text-[13px] uppercase font-bold tracking-widest text-slate-900">{nextPrayerName}</span>
            <span className="text-2xl font-black mt-0 text-slate-800">{format(nextPrayerTimeObj, 'hh:mm')}</span>
          </div>
        </div>

        {/* Quick Actions separated by lines */}
        <div className="flex items-center gap-1 flex-1 justify-around h-16 ml-2">
          <div className="h-full w-px bg-slate-200"></div>
          
          <button onClick={() => setView?.('Qibla')} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">Qibla</span>
          </button>
          
          <div className="h-full w-px bg-slate-200"></div>
          
          <button onClick={() => setView?.('Quran')} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">Quran</span>
          </button>
          
          {/* Silent Mode sticks out slightly */}
          <button onClick={handleGlobalSilentToggle} className="flex flex-col items-center gap-1 relative z-10 -mr-4 ml-2 hover:opacity-80 transition-opacity">
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md border-4 border-emerald-950 transition-colors",
              settings.silentMode ? "bg-red-400" : "bg-slate-400"
            )}>
              {settings.silentMode ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-slate-800 absolute -bottom-5 right-1 whitespace-nowrap">
              {settings.silentMode ? 'Silent On' : 'Silent Off'}
            </span>
          </button>
        </div>
      </div>

      {/* Auto Location Banner */}
      <div className="bg-[#cc0000] text-white text-center py-3 rounded-xl mb-4 mx-2">
        <div className="text-2xl font-black tracking-widest uppercase">NAMAZ TIME</div>
        <div className="text-3xl font-black font-arabic mt-1">أوقات الصلاة</div>
      </div>

      {/* Prayer Times List Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-8 relative pb-16">
        
        <div className="divide-y divide-slate-100 px-2 text-slate-700">
          {prayers.map((prayer, idx) => {
            const timeObj = parse(prayer.time.split(' ')[0], 'HH:mm', now);
            const isFajr = prayer.name === 'Fajr';
            // Mocking end times for demonstration like the image
            const endTimeObj = addDays(timeObj, 0); 
            endTimeObj.setHours(timeObj.getHours() + 1);
            endTimeObj.setMinutes(timeObj.getMinutes() + 24);

            return (
              <div key={prayer.name} className="flex flex-row items-center justify-between p-4 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 w-1/4">
                  {isFajr ? <span className="text-slate-400 text-lg">⏱️</span> : idx === 3 ? <span className="text-slate-400 text-lg">🌒</span> : <span className="text-slate-400 text-lg">🌘</span>}
                  <span className="font-bold text-[15px] font-sans text-slate-800">{prayer.name}</span>
                </div>
                
                <div className="flex items-center justify-end space-x-2 flex-1 text-right">
                  {editingPrayer === prayer.name ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={editingTime}
                        onChange={(e) => setEditingTime(e.target.value)}
                        className="p-1 rounded border border-slate-300 text-sm font-bold text-slate-800"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEdit(prayer.name)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full text-center">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="font-bold text-[15px] text-slate-800 tracking-tight flex items-center group/edit gap-2">
                      <button onClick={() => handleEditClick(prayer.name, prayer.time)} className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <span>
                        {format(timeObj, 'hh:mm:ss')} <span className="text-[12px] text-slate-400 font-semibold">{format(timeObj, 'a')}</span>
                      </span>
                    </div>
                  )}
                  
                  {isFajr && !editingPrayer && (
                    <div className="hidden sm:flex text-slate-400 items-center justify-center px-1">
                      —
                      <span className="font-bold text-[15px] text-[#cc0000] ml-2 tracking-tight">
                        {format(endTimeObj, 'hh:mm:ss')} <span className="text-[12px] text-[#cc0000] font-semibold">{format(endTimeObj, 'a')}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="w-10 flex justify-end">
                  <button onClick={() => toggleAlarm(prayer.name)} className="text-slate-600">
                    {alarms[prayer.name] ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-300" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Times Toggle */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex border border-slate-100 mb-8">
          <button className="px-6 py-2 bg-[#8db69b] text-white rounded-full text-sm font-semibold shadow-sm">
            Fard Times
          </button>
          <button className="px-6 py-2 text-slate-500 rounded-full text-sm font-medium hover:bg-slate-50">
            Other Times
          </button>
        </div>
      </div>
    </div>
  );
}

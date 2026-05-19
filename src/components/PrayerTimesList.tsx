import { PrayerTimings } from '../lib/api';
import { Volume2, VolumeX, Compass, BookOpen, MapPin, Search, Pencil, Check, Clock, Sun, Sunrise, HelpCircle, AlarmClock, X } from 'lucide-react';
import { parse, format, isAfter, isBefore, addDays, addMinutes, subMinutes, differenceInMinutes } from 'date-fns';
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
    'Asr': true, 'Isha': true, 'Jumma': true, 'Tahajjud': true
  });
  const [now, setNow] = useState(new Date());
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'fard' | 'other'>('fard');
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [tahajjudAlarmTime, setTahajjudAlarmTime] = useLocalStorage('tahajjud-alarm-time', { hour: 7, minute: 59, period: 'PM' });
  const [tempHour, setTempHour] = useState(7);
  const [tempMinute, setTempMinute] = useState(59);
  const [tempPeriod, setTempPeriod] = useState<'AM'|'PM'>('PM');

  // Sync temp state when opening modal
  useEffect(() => {
    if (isReminderOpen) {
      setTempHour(tahajjudAlarmTime.hour);
      setTempMinute(tahajjudAlarmTime.minute);
      setTempPeriod(tahajjudAlarmTime.period as 'AM'|'PM');
    }
  }, [isReminderOpen, tahajjudAlarmTime]);

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

  const fajrTime = timings ? parse(timings.Fajr.split(' ')[0], 'HH:mm', now) : now;
  const sunriseTime = timings ? parse(timings.Sunrise.split(' ')[0], 'HH:mm', now) : now;
  const sunsetTime = timings ? parse(timings.Sunset.split(' ')[0], 'HH:mm', now) : now;
  
  const tahajjudTime = timings?.Lastthird ? parse(timings.Lastthird.split(' ')[0], 'HH:mm', now) : subMinutes(fajrTime, 90);
  const ishraqTime = addMinutes(sunriseTime, 20);
  const totalMins = differenceInMinutes(sunsetTime, fajrTime);
  const dahwaEKubraTime = addMinutes(fajrTime, Math.floor(totalMins / 2));
  const avoidDelayTime = subMinutes(sunsetTime, 45);

  const otherTimes = [
    { name: 'Tahajjud', timeObj: tahajjudTime, icon: '✨', hasHelp: true, canAlarm: true },
    { name: 'Sun Rise', timeObj: sunriseTime, icon: '🌅', hasHelp: true, canAlarm: false },
    { name: 'Ishraq & Chasht', timeObj: ishraqTime, icon: '☀️', hasHelp: false, canAlarm: false },
    { name: 'Dahwa-e-kubra', timeObj: dahwaEKubraTime, icon: '🌞', hasHelp: true, canAlarm: false },
    { name: 'Avoid Delay', timeObj: avoidDelayTime, icon: '⏳', hasHelp: true, canAlarm: false },
  ];

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

  const getPrevHour = (h: number) => h === 1 ? 12 : h - 1;
  const getNextHour = (h: number) => h === 12 ? 1 : h + 1;
  const getPrevMin = (m: number) => m === 0 ? 59 : m - 1;
  const getNextMin = (m: number) => m === 59 ? 0 : m + 1;
  const togglePeriod = (p: 'AM'|'PM') => p === 'AM' ? 'PM' : 'AM';
  const formatMin = (m: number) => m.toString().padStart(2, '0');

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
            <span className="text-xs uppercase font-bold tracking-widest text-slate-900">{nextPrayerName}</span>
            <span className="text-xl font-bold mt-0 text-slate-800">{format(nextPrayerTimeObj, 'hh:mm')}</span>
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
        <div className="text-[17px] font-black tracking-widest uppercase">NAMAZ TIME</div>
        <div className="text-2xl font-black font-arabic mt-1">أوقات الصلاة</div>
      </div>

      {/* Prayer Times List Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-8 relative pb-16">
        
        <div className="divide-y divide-slate-100 px-2 text-slate-700 w-full min-h-[300px]">
          {activeTab === 'fard' ? (
            prayers.map((prayer, idx) => {
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
                    <span className="font-semibold text-sm font-sans text-slate-800">{prayer.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 flex-1 text-right">
                    {editingPrayer === prayer.name ? (
                      <div className="flex items-center gap-2">
                         <input 
                          type="time" 
                          value={editingTime}
                          onChange={(e) => setEditingTime(e.target.value)}
                          className="p-1 rounded border border-slate-300 text-sm font-medium text-slate-800"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(prayer.name)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full text-center">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="font-semibold text-sm text-slate-800 tracking-tight flex items-center group/edit gap-2">
                        <button onClick={() => handleEditClick(prayer.name, prayer.time)} className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <span>
                          {format(timeObj, 'hh:mm')} <span className="text-[11px] text-slate-500 font-medium">{format(timeObj, 'a')}</span>
                        </span>
                      </div>
                    )}
                    
                    {isFajr && !editingPrayer && (
                      <div className="hidden sm:flex text-slate-400 items-center justify-center px-1">
                        —
                        <span className="font-semibold text-sm text-[#cc0000] ml-2 tracking-tight">
                          {format(endTimeObj, 'hh:mm')} <span className="text-[11px] text-[#cc0000] font-medium">{format(endTimeObj, 'a')}</span>
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
            })
          ) : (
            otherTimes.map((ot) => {
              const { timeObj } = ot;
              return (
                <div key={ot.name} className="flex flex-row items-center justify-between p-4 group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3 w-1/2">
                    <span className="text-slate-400 text-lg">{ot.icon}</span>
                    <span className="font-semibold text-sm font-sans text-slate-800 flex items-center gap-1">
                      {ot.name}
                      {ot.hasHelp && (
                        <div className="bg-[#f0e68c]/50 text-yellow-600 rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold text-[10px]">
                          ?
                        </div>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {ot.name !== 'Tahajjud' && (
                      <div className="font-semibold text-sm text-slate-800 tracking-tight flex items-center">
                        <span>
                          {format(timeObj, 'hh:mm:ss')} <span className="text-[11px] text-slate-500 font-medium">{format(timeObj, 'a')}</span>
                        </span>
                      </div>
                    )}

                    <div className="w-14 justify-end flex items-center gap-3">
                      {ot.canAlarm ? (
                        <>
                          {ot.name === 'Tahajjud' && (
                            <button onClick={() => setIsReminderOpen(true)} className="text-slate-600 transition-colors bg-[#8B0000] p-1.5 rounded-full">
                              <AlarmClock className="w-4 h-4 text-white" strokeWidth={2.5} />
                            </button>
                          )}
                          <button onClick={() => toggleAlarm(ot.name)} className="text-slate-600">
                            {alarms[ot.name] ? <Volume2 className="w-5 h-5 text-slate-400 fill-slate-400" /> : <VolumeX className="w-5 h-5 text-slate-400 fill-slate-400" />}
                          </button>
                        </>
                      ) : (
                        <span className="w-5 h-5 block"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Times Toggle */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow-[0_5px_15px_rgba(0,0,0,0.08)] flex border border-slate-100 mb-8">
          <button 
            onClick={() => setActiveTab('fard')} 
            className={cn("px-6 py-2 rounded-full text-sm font-semibold transition-colors", activeTab === 'fard' ? "bg-[#8db69b] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50")}
          >
            Fard Times
          </button>
          <button 
            onClick={() => setActiveTab('other')} 
            className={cn("px-6 py-2 rounded-full text-sm font-semibold transition-colors", activeTab === 'other' ? "bg-[#8db69b] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50")}
          >
            Other Times
          </button>
        </div>
      </div>

      {/* Reminder Modal */}
      {isReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[340px] shadow-2xl p-8 pb-6 relative">
            <h2 className="text-[19px] leading-[1.3] font-medium text-slate-700 mb-10 font-sans">
              When should the Tahajjud reminder be sent?
            </h2>
            
            <div className="flex flex-col items-center justify-center font-sans mb-10">
              <div className="flex items-center gap-1">
                 {/* Hours column */}
                 <div className="w-16 flex flex-col items-center">
                    <div onClick={() => setTempHour(getPrevHour(tempHour))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{getPrevHour(tempHour)}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">{tempHour}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div onClick={() => setTempHour(getNextHour(tempHour))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{getNextHour(tempHour)}</div>
                 </div>

                 {/* Separator */}
                 <div className="flex flex-col items-center justify-center h-full pb-2">
                    <div className="h-12"></div>
                    <div className="h-10 flex items-center justify-center font-medium text-slate-500 text-lg px-1">:</div>
                    <div className="h-12"></div>
                 </div>

                 {/* Minutes column */}
                 <div className="w-16 flex flex-col items-center">
                    <div onClick={() => setTempMinute(getPrevMin(tempMinute))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{formatMin(getPrevMin(tempMinute))}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">{formatMin(tempMinute)}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div onClick={() => setTempMinute(getNextMin(tempMinute))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{formatMin(getNextMin(tempMinute))}</div>
                 </div>

                 {/* AM/PM column */}
                 <div className="w-16 flex flex-col items-center ml-2">
                    <div onClick={() => setTempPeriod(togglePeriod(tempPeriod))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{togglePeriod(tempPeriod)}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">{tempPeriod}</div>
                    <div className="w-14 border-t-2 border-slate-400/80"></div>
                    <div onClick={() => setTempPeriod(togglePeriod(tempPeriod))} className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50">{togglePeriod(tempPeriod)}</div>
                 </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setTahajjudAlarmTime({ hour: tempHour, minute: tempMinute, period: tempPeriod });
                setIsReminderOpen(false);
              }}
              className="w-full bg-[#1c1c1e] hover:bg-black text-white py-[18px] rounded-3xl font-medium text-[16px] transition-colors"
            >
              Set Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

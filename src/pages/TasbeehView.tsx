import { SmartReferenceLink } from "../lib/referenceSystem/SmartReferenceLink";
import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from 'usehooks-ts';
import { RotateCcw, Vibrate, CheckCircle, ChevronLeft, BarChart3, X, Volume2, VolumeX, Undo2, Bell, BellOff, Settings2, Target, Clock, Trophy, Database, Globe } from "@/src/lib/icons";
import { useCallback, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfWeek, parseISO, isSameWeek, isSameMonth } from 'date-fns';
import { useTranslation } from '../lib/i18n';
import { useSettings } from '../hooks/useSettings';

let audioCtx: AudioContext | null = null;

const playTickSound = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // ignore
  }
};

type PresetKey = 'subhanAllah' | 'alhamdulillah' | 'allahuAkbar' | 'astaghfirullah' | 'duroodSharif' | 'customTasbeeh';

interface Preset {
  id: PresetKey;
  target: number;
}

const SEQUENCE: PresetKey[] = ['subhanAllah', 'alhamdulillah', 'allahuAkbar', 'astaghfirullah', 'duroodSharif'];

const PRESETS: Preset[] = [
  { id: 'subhanAllah', target: 33 },
  { id: 'alhamdulillah', target: 33 },
  { id: 'allahuAkbar', target: 34 },
  { id: 'astaghfirullah', target: 100 },
  { id: 'duroodSharif', target: 100 },
  { id: 'customTasbeeh', target: 100 },
];

interface HistoryEntry {
  date: string;
  count: number;
}

export function TasbeehView({ setView }: { setView: (v: string) => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);

  const [activePresetId, setActivePresetId] = useLocalStorage<PresetKey>('islamic-tasbeeh-preset', 'subhanAllah');
  const [counts, setCounts] = useLocalStorage<Record<string, number>>('islamic-tasbeeh-counts', {});
  const [customTarget, setCustomTarget] = useLocalStorage('islamic-tasbeeh-custom-target', 100);
  
  const [hapticEnabled, setHapticEnabled] = useLocalStorage('islamic-tasbeeh-haptic', true);
  const [audioEnabled, setAudioEnabled] = useLocalStorage('islamic-tasbeeh-audio', true);
  const [remindersEnabled, setRemindersEnabled] = useLocalStorage('islamic-tasbeeh-reminders', false);
  const [reminderTime, setReminderTime] = useLocalStorage('islamic-tasbeeh-reminder-time', '09:00');
  const [dailyGoal, setDailyGoal] = useLocalStorage('islamic-tasbeeh-daily-goal', 1000);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('islamic-tasbeeh-history', []);
  
  const [showHistory, setShowHistory] = useState(false);
  const [statView, setStatView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showSettings, setShowSettings] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentCount = counts[activePresetId] || 0;
  
  const currentTarget = useMemo(() => {
    if (activePresetId === 'customTasbeeh') return customTarget;
    return PRESETS.find(p => p.id === activePresetId)?.target || 33;
  }, [activePresetId, customTarget]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCount = history.find(h => h.date === todayStr)?.count || 0;
  const totalLifetimeCount = history.reduce((acc, curr) => acc + curr.count, 0);

  const handleTap = useCallback(() => {
    if (sessionCompleted || isTransitioning) return;

    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (audioEnabled) {
      playTickSound();
    }
    
    const newCount = currentCount + 1;
    
    setCounts(prev => ({
      ...prev,
      [activePresetId]: newCount
    }));
    
    setHistory(prev => {
      const newHistory = [...prev];
      const existingIdx = newHistory.findIndex(h => h.date === todayStr);
      if (existingIdx >= 0) {
        newHistory[existingIdx] = { ...newHistory[existingIdx], count: newHistory[existingIdx].count + 1 };
      } else {
        newHistory.push({ date: todayStr, count: 1 });
      }
      return newHistory;
    });

    const currentIdx = SEQUENCE.indexOf(activePresetId);
    if (currentIdx >= 0 && newCount === currentTarget) {
      setIsTransitioning(true);
      if (currentIdx < SEQUENCE.length - 1) {
        setTimeout(() => {
          const nextPreset = SEQUENCE[currentIdx + 1];
          setActivePresetId(nextPreset);
          setCounts(c => ({ ...c, [nextPreset]: 0 }));
          
          const currentName = t(activePresetId as any) || activePresetId;
          const nextName = t(nextPreset as any) || nextPreset;
          setTransitionMessage(`${currentName} completed. Switched to ${nextName}.`);
          
          setIsTransitioning(false);
          setTimeout(() => setTransitionMessage(null), 4000);
        }, 800);
      } else {
        setTimeout(() => {
          setSessionCompleted(true);
          setIsTransitioning(false);
        }, 800);
      }
    }
  }, [activePresetId, currentCount, currentTarget, hapticEnabled, audioEnabled, setCounts, setHistory, todayStr, sessionCompleted, isTransitioning, t, setActivePresetId]);

  const handleUndo = useCallback(() => {
    if (currentCount > 0) {
      if (hapticEnabled && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setCounts(prev => ({
        ...prev,
        [activePresetId]: prev[activePresetId] - 1
      }));
      
      setHistory(prev => {
        const newHistory = [...prev];
        const existingIdx = newHistory.findIndex(h => h.date === todayStr);
        if (existingIdx >= 0 && newHistory[existingIdx].count > 0) {
          newHistory[existingIdx] = { ...newHistory[existingIdx], count: newHistory[existingIdx].count - 1 };
        }
        return newHistory;
      });
    }
  }, [currentCount, activePresetId, hapticEnabled, setCounts, setHistory, todayStr]);

  const handleReset = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
    setCounts(prev => ({
      ...prev,
      [activePresetId]: 0
    }));
  };

  const handleToggleReminders = async () => {
    if (!remindersEnabled && "Notification" in window && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setRemindersEnabled(true);
      }
    } else {
      setRemindersEnabled(!remindersEnabled);
    }
  };

  const progress = Math.min(100, (currentCount / currentTarget) * 100);

  const getChartData = () => {
    const now = new Date();
    if (statView === 'daily') {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(now, 6 - i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const entry = history.find(h => h.date === dateStr);
        return { name: format(d, 'E'), count: entry ? entry.count : 0 };
      });
    } else if (statView === 'weekly') {
      return Array.from({ length: 4 }).map((_, i) => {
        const start = startOfWeek(subDays(now, (3 - i) * 7));
        let weekCount = 0;
        history.forEach(h => {
          if (isSameWeek(parseISO(h.date), start)) {
            weekCount += h.count;
          }
        });
        return { name: 'W' + (4 - i), count: weekCount };
      });
    } else {
      return Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        let monthCount = 0;
        history.forEach(h => {
          if (isSameMonth(parseISO(h.date), d)) {
            monthCount += h.count;
          }
        });
        return { name: format(d, 'MMM'), count: monthCount };
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 w-full min-h-screen pt-8 px-4 flex flex-col items-center"
    >
      <div className="w-full max-w-sm bg-[#0f172a] rounded-3xl backdrop-blur-md border border-emerald-500/20 p-6 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        <div className="w-full mb-4"><SmartReferenceLink topic="Tasbih" /></div>{/* Header Controls */}
        <div className="w-full flex justify-between items-center mb-6 relative z-10">
          <button 
            onClick={() => setView('home')}
            className="p-2 pl-1.5 rounded-full transition-colors bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 flex items-center gap-1"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium pr-3">{t("home")}</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={"p-2.5 rounded-full transition-colors " + (audioEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800/40 text-slate-400')}
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
              onClick={() => setHapticEnabled(!hapticEnabled)}
              className={"p-2.5 rounded-full transition-colors " + (hapticEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800/40 text-slate-400')}
            >
              <Vibrate size={18} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-full transition-colors bg-slate-800/40 text-slate-400 hover:text-emerald-300"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Daily Goal Progress Bar Mini */}
        <div className="w-full bg-slate-800/40 rounded-xl p-3 mb-6 flex flex-col gap-2 border border-emerald-500/10">
           <div className="flex justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1"><Target size={12} className="text-emerald-400"/> Daily Goal</span>
              <span>{todayCount} / {dailyGoal}</span>
           </div>
           <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }} />
           </div>
        </div>

        {/* Preset Selector */}
        <div className="w-full mb-8 relative z-10">
          <select 
            value={activePresetId}
            onChange={(e) => setActivePresetId(e.target.value as PresetKey)}
            className="w-full bg-slate-800/60 border border-emerald-500/30 text-white rounded-xl p-3 outline-none font-semibold text-center appearance-none shadow-inner"
          >
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{t(p.id as any) || p.id} ({p.target})</option>
            ))}
          </select>
          {activePresetId === 'customTasbeeh' && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-400">Target:</span>
              <input 
                type="number" 
                value={customTarget}
                onChange={(e) => setCustomTarget(Math.max(1, parseInt(e.target.value) || 100))}
                className="bg-slate-800 border border-emerald-500/30 text-white rounded-lg p-1.5 w-20 text-center font-bold"
              />
            </div>
          )}
        </div>

        {/* Counter Display */}
        <div className="relative mb-12 z-10">
          <svg className="w-64 h-64 -rotate-90 drop-shadow-xl">
            <circle
              cx="128" cy="128" r="110"
              stroke="currentColor" strokeWidth="8" fill="transparent"
              className="text-emerald-950/50"
            />
            <motion.circle
              cx="128" cy="128" r="110"
              stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="transparent"
              strokeDasharray={110 * 2 * Math.PI}
              className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
              initial={{ strokeDashoffset: 110 * 2 * Math.PI }}
              animate={{ 
                strokeDashoffset: (110 * 2 * Math.PI) * (1 - progress / 100) 
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold text-white tabular-nums tracking-tighter drop-shadow-md">
              {currentCount}
            </span>
            <span className="text-sm text-emerald-200/60 font-medium mt-1">
              / {currentTarget}
            </span>
            {currentCount >= currentTarget && currentCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-300 mt-2 flex items-center gap-1 font-medium bg-emerald-900/60 px-3 py-1 rounded-full text-xs border border-emerald-500/30"
              >
                <CheckCircle size={14} /> {t("completed")}
              </motion.div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-8 z-10">
          <button 
            onClick={handleUndo}
            disabled={currentCount === 0}
            className="p-4 bg-slate-800/60 text-slate-300 rounded-full hover:bg-slate-700/80 transition-colors disabled:opacity-50"
          >
            <Undo2 size={24} />
          </button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTap}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.4)] touch-manipulation relative overflow-hidden flex items-center justify-center border-4 border-emerald-300 group focus:outline-none"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-bold text-2xl tracking-wider font-sans shadow-md">TAP</span>
          </motion.button>
          
          <button 
            onClick={handleReset}
            className="p-4 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800/60 backdrop-blur-md border border-emerald-500/20 text-emerald-100 rounded-full hover:bg-slate-700/80 transition-colors z-10 shadow-lg w-full justify-center font-semibold"
        >
          <BarChart3 size={18} className="text-emerald-400" />
          <span>{t("tracker") || "Progress Tracker"}</span>
        </button>

        {/* Transition Message */}
        <AnimatePresence>
          {transitionMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-32 left-0 right-0 mx-auto w-max max-w-[90%] bg-emerald-900/95 text-emerald-100 text-sm py-2 px-4 rounded-full shadow-lg z-30 text-center border border-emerald-500/30 backdrop-blur-sm"
            >
              {transitionMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Completed Overlay */}
        <AnimatePresence>
          {sessionCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">All Tasbih Completed</h3>
              <p className="text-emerald-200/70 mb-8">May Allah accept your Dhikr.</p>
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setSessionCompleted(false);
                    setActivePresetId(SEQUENCE[0]);
                    setCounts(prev => ({ ...prev, [SEQUENCE[0]]: 0 }));
                  }}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Repeat from Beginning
                </button>
                <button
                  onClick={() => {
                    setSessionCompleted(false);
                    setView('home');
                  }}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold rounded-xl transition-colors"
                >
                  Finish Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-emerald-100 flex items-center gap-2">
                <BarChart3 className="text-emerald-500" />
                {t("tracker") || "Statistics"}
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-2">
                 <div className="bg-slate-800/50 rounded-xl p-3 border border-emerald-500/10">
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1"><Target size={12}/> Today</div>
                    <div className="text-xl font-bold text-white mt-1">{todayCount}</div>
                 </div>
                 <div className="bg-slate-800/50 rounded-xl p-3 border border-emerald-500/10">
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1"><Trophy size={12}/> Lifetime</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{totalLifetimeCount}</div>
                 </div>
              </div>
              
              <div className="flex bg-slate-800/50 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setStatView(v)}
                    className={"flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors " + (statView === v ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400')}
                  >
                    {t(v as any) || v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="h-48 w-full mt-2">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', borderRadius: '12px', color: '#f8fafc', fontWeight: 'bold' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]}>
                         {getChartData().map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#10b981' : '#334155'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                    No activity yet. Start tapping!
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#0f172a] sm:p-4 flex flex-col"
          >
            <div className="w-full h-full max-w-2xl mx-auto bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden sm:border sm:border-emerald-500/20">
              
              {/* Header */}
              <div className="flex-shrink-0 p-6 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/80 backdrop-blur-md z-10 relative">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings2 className="text-emerald-500 w-7 h-7" />
                  Tasbih Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2.5 bg-slate-800/80 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
                 {/* 1. Daily Goal */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">1. Daily Goal</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                      <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                        <Target size={16} className="text-emerald-400"/> Set Daily Target
                      </label>
                      <input 
                        type="number" 
                        value={dailyGoal}
                        onChange={(e) => setDailyGoal(Math.max(1, parseInt(e.target.value) || 1000))}
                        className="w-full bg-slate-900/80 border border-emerald-500/30 text-white rounded-xl p-3 outline-none font-semibold focus:border-emerald-500 transition-colors"
                      />
                    </div>
                 </section>

                 {/* 2. Reminder Settings */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">2. Reminder Settings</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Bell size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white">Daily Reminder</div>
                               <div className="text-xs text-slate-400">Receive tasbeeh notification</div>
                            </div>
                          </div>
                          <button 
                             onClick={handleToggleReminders}
                             className={`w-12 h-6 rounded-full transition-colors relative ${remindersEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${remindersEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>

                       {remindersEnabled && (
                         <div className="pt-4 border-t border-slate-700/50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                              <Clock size={16} className="text-emerald-400"/> Reminder Time
                            </label>
                            <input 
                              type="time" 
                              value={reminderTime}
                              onChange={(e) => setReminderTime(e.target.value)}
                              className="w-full bg-slate-900/80 border border-emerald-500/30 text-white rounded-xl p-3 outline-none font-semibold focus:border-emerald-500 transition-colors"
                            />
                         </div>
                       )}
                    </div>
                 </section>

                 {/* 3. Counter Settings */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">3. Counter Settings</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <RotateCcw size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white">Auto Reset</div>
                               <div className="text-xs text-slate-400">Reset on app open</div>
                            </div>
                          </div>
                          <button 
                             className={`w-12 h-6 rounded-full transition-colors relative bg-slate-700 opacity-50 cursor-not-allowed`}
                          >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform left-1`} />
                          </button>
                       </div>
                    </div>
                 </section>

                 {/* 4. Sound & Vibration */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">4. Sound & Vibration</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Volume2 size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white">Tap Sound</div>
                               <div className="text-xs text-slate-400">Play tick on count</div>
                            </div>
                          </div>
                          <button 
                             onClick={() => setAudioEnabled(!audioEnabled)}
                             className={`w-12 h-6 rounded-full transition-colors relative ${audioEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${audioEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                       
                       <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Vibrate size={18} />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-white">Haptic Feedback</div>
                               <div className="text-xs text-slate-400">Vibrate on tap</div>
                            </div>
                          </div>
                          <button 
                             onClick={() => setHapticEnabled(!hapticEnabled)}
                             className={`w-12 h-6 rounded-full transition-colors relative ${hapticEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${hapticEnabled ? 'left-7' : 'left-1'}`} />
                          </button>
                       </div>
                    </div>
                 </section>

                 {/* 5. Statistics */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">5. Statistics</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                       <button onClick={() => { setShowSettings(false); setShowHistory(true); }} className="w-full flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <BarChart3 size={18} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-bold text-white">View Full History</div>
                               <div className="text-xs text-slate-400">Check charts and milestones</div>
                            </div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-slate-500 rotate-180 group-hover:text-emerald-400 transition-colors" />
                       </button>
                    </div>
                 </section>

                 {/* 6. Backup & Restore */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">6. Backup & Restore</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                       <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Database size={18} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-bold text-white">Cloud Backup</div>
                               <div className="text-xs text-slate-400">Sync with Google Drive</div>
                            </div>
                          </div>
                          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-md">Pro</span>
                       </div>
                    </div>
                 </section>

                 {/* 7. Language */}
                 <section className="space-y-4">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">7. Language</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Globe size={18} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-bold text-white">App Language</div>
                               <div className="text-xs text-slate-400">{settings.language}</div>
                            </div>
                          </div>
                          <button onClick={() => setView('settings')} className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                             Change
                          </button>
                       </div>
                    </div>
                 </section>

                 {/* 8. Advanced Settings */}
                 <section className="space-y-4 pb-12">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">8. Advanced Settings</h4>
                    <div className="bg-slate-800/40 border border-emerald-500/10 rounded-2xl p-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                              <RotateCcw size={18} />
                            </div>
                            <div className="text-left">
                               <div className="text-sm font-bold text-red-400">Reset All Data</div>
                               <div className="text-xs text-slate-400">Clear all tasbeeh history</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to clear all Tasbeeh history? This cannot be undone.")) {
                                localStorage.removeItem('islamic-tasbeeh-history');
                                localStorage.removeItem('islamic-tasbeeh-counts');
                                window.location.reload();
                              }
                            }}
                            className="text-sm font-medium text-slate-500 hover:text-red-400 transition-colors"
                          >
                             Reset
                          </button>
                       </div>
                    </div>
                 </section>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

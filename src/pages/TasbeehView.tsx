import { motion, AnimatePresence } from 'motion/react';
import { useLocalStorage } from 'usehooks-ts';
import { RotateCcw, Vibrate, CheckCircle, ChevronLeft, BarChart3, X, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

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

export function TasbeehView({ setView }: { setView: (v: string) => void }) {
  const [count, setCount] = useLocalStorage('islamic-tasbeeh-count', 0);
  const [target, setTarget] = useLocalStorage('islamic-tasbeeh-target', 33);
  const [hapticEnabled, setHapticEnabled] = useLocalStorage('islamic-tasbeeh-haptic', true);
  const [audioEnabled, setAudioEnabled] = useLocalStorage('islamic-tasbeeh-audio', true);
  const [history, setHistory] = useLocalStorage<{date: string, count: number}[]>('islamic-tasbeeh-history', []);
  const [showHistory, setShowHistory] = useState(false);

  const handleTap = useCallback(() => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50); // Light haptic feedback
    }
    if (audioEnabled) {
      playTickSound();
    }
    setCount((c) => c + 1);
    
    // Update daily history
    const todayStr = format(new Date(), 'MMM dd');
    setHistory(prev => {
      const newHistory = [...prev];
      const existingIdx = newHistory.findIndex(h => h.date === todayStr);
      if (existingIdx >= 0) {
        newHistory[existingIdx] = { ...newHistory[existingIdx], count: newHistory[existingIdx].count + 1 };
      } else {
        newHistory.push({ date: todayStr, count: 1 });
      }
      // Keep only last 7 days to not overflow simple charts
      return newHistory.slice(-7);
    });
  }, [hapticEnabled, audioEnabled, setCount, setHistory]);

  const handleReset = () => {
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]); // Distinct feedback for reset
    }
    setCount(0);
  };

  const handleToggleHaptic = () => {
    if (!hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
    setHapticEnabled(!hapticEnabled);
  };

  const handleToggleAudio = () => {
    if (!audioEnabled) {
      playTickSound();
    }
    setAudioEnabled(!audioEnabled);
  };

  const progress = Math.min(100, (count / target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-24 w-full min-h-screen pt-8 px-4 flex flex-col items-center"
    >
      <div className="w-full max-w-sm bg-emerald-900/40 rounded-3xl backdrop-blur-md border border-emerald-500/20 p-6 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Header Controls */}
        <div className="w-full flex justify-between items-center mb-12 relative z-10">
          <button 
            onClick={() => setView('home')}
            className={`p-2 pl-1.5 rounded-full transition-colors bg-slate-800/40 hover:bg-slate-700/60 text-slate-200 flex items-center gap-1`}
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium pr-3">Back</span>
          </button>

          <div className="flex gap-2 relative">
            <button 
              onClick={handleToggleAudio}
              className={`p-2.5 rounded-full transition-colors ${audioEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800/40 text-slate-400'}`}
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button 
              onClick={handleToggleHaptic}
              className={`p-2.5 rounded-full transition-colors ${hapticEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800/40 text-slate-400'}`}
            >
              <Vibrate size={18} />
            </button>
          </div>
          
          <div className="text-sm font-medium text-emerald-100 flex items-center gap-2">
            Target: 
            <select 
              value={target} 
              onChange={(e) => setTarget(Number(e.target.value))}
              className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-100 text-sm rounded-lg p-1 outline-none font-bold"
            >
              <option value={33}>33</option>
              <option value={100}>100</option>
              <option value={1000}>1000</option>
            </select>
          </div>

          <button 
            onClick={handleReset}
            className="p-3 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Counter Display */}
        <div className="relative mb-12 z-10">
          <svg className="w-64 h-64 -rotate-90 drop-shadow-xl">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-emerald-950/50"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              fill="transparent"
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
              {count}
            </span>
            {count >= target && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-300 mt-2 flex items-center gap-1 font-medium bg-emerald-900/60 px-3 py-1 rounded-full text-xs border border-emerald-500/30"
              >
                <CheckCircle size={14} /> Reached
              </motion.div>
            )}
          </div>
        </div>

        {/* Tap Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleTap}
          className="w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-[0_15px_40px_rgba(16,185,129,0.4)] touch-manipulation relative overflow-hidden flex items-center justify-center border-4 border-emerald-300 group focus:outline-none z-10"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-white font-bold text-3xl tracking-wider font-sans shadow-md">TAP</span>
        </motion.button>
        
        <button
          onClick={() => setShowHistory(true)}
          className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-slate-800/60 backdrop-blur-md border border-emerald-500/20 text-emerald-100 rounded-full hover:bg-slate-700/80 transition-colors z-10 shadow-lg"
        >
          <BarChart3 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold tracking-wide">Daily History</span>
        </button>
        
        {/* Subtle decorative background ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-[1/1] rounded-full border border-emerald-500/10 pointer-events-none z-0" />
      </div>

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
              className="w-full max-w-sm bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-emerald-100 mb-6 flex items-center gap-2">
                <BarChart3 className="text-emerald-500" />
                7-Day Progress
              </h3>
              
              <div className="h-48 w-full mt-4">
                {history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', borderRadius: '12px', color: '#f8fafc', fontWeight: 'bold' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
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
    </motion.div>
  );
}

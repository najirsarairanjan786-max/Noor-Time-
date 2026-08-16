import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Calculator, Plus, Minus, RotateCcw, AlertTriangle } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'witr';

const PRAYERS: { id: PrayerType; label: string; arabic: string; color: string }[] = [
  { id: 'fajr', label: 'Fajr', arabic: 'الفجر', color: 'bg-blue-500' },
  { id: 'dhuhr', label: 'Dhuhr', arabic: 'الظهر', color: 'bg-amber-500' },
  { id: 'asr', label: 'Asr', arabic: 'العصر', color: 'bg-orange-500' },
  { id: 'maghrib', label: 'Maghrib', arabic: 'المغرب', color: 'bg-red-500' },
  { id: 'isha', label: 'Isha', arabic: 'العشاء', color: 'bg-indigo-500' },
  { id: 'witr', label: 'Witr', arabic: 'الوتر', color: 'bg-emerald-500' },
];

export function QazaNamazCalculator({ setView }: { setView: (v: string) => void }) {
  const [qazaCounts, setQazaCounts] = useLocalStorage<Record<PrayerType, number>>('qaza_namaz_counts', {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator State
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);

  const increment = (id: PrayerType) => {
    setQazaCounts(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const decrement = (id: PrayerType) => {
    setQazaCounts(prev => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const calculateMissed = () => {
    const totalDays = (years * 365) + (months * 30) + days;
    
    setQazaCounts(prev => {
      const newCounts = { ...prev };
      PRAYERS.forEach(p => {
        newCounts[p.id] = prev[p.id] + totalDays;
      });
      return newCounts;
    });
    
    setShowCalculator(false);
    setYears(0);
    setMonths(0);
    setDays(0);
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset all Qaza Namaz counts to 0?")) {
      setQazaCounts({
        fajr: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
        witr: 0,
      });
    }
  };

  const totalMissed = Object.values(qazaCounts).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col bg-gray-50"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setView('home')}
          className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Qaza Namaz</h1>
        <button
          onClick={resetAll}
          className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-red-50 transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-500 hover:text-red-500" />
        </button>
      </div>

      <div className="bg-emerald-600 rounded-3xl p-6 shadow-md mb-6 relative overflow-hidden text-white">
        <div className="absolute top-[-20%] right-[-10%] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-emerald-100 mb-1">Total Missed Prayers</h2>
            <p className="text-4xl font-extrabold tracking-tight">{totalMissed.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Calculator className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <button 
          onClick={() => setShowCalculator(true)}
          className="mt-6 w-full bg-white text-emerald-700 font-bold py-3 rounded-xl shadow-sm hover:bg-emerald-50 transition-colors active:scale-95"
        >
          Calculate by Time Period
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
        {PRAYERS.map(prayer => (
          <div key={prayer.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-arabic text-lg ${prayer.color}`}>
                {prayer.arabic}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{prayer.label}</h3>
                <p className="text-sm text-gray-500 font-medium">{qazaCounts[prayer.id].toLocaleString()} remaining</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-full border border-gray-100">
              <button 
                onClick={() => decrement(prayer.id)}
                disabled={qazaCounts[prayer.id] === 0}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-50 disabled:shadow-none transition-colors hover:bg-gray-100 active:scale-95"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => increment(prayer.id)}
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Calculate Missed</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Enter the period of time for which you missed your prayers.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <label className="w-20 text-sm font-bold text-gray-700">Years</label>
                    <input 
                      type="number" 
                      min="0"
                      value={years || ''} 
                      onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-20 text-sm font-bold text-gray-700">Months</label>
                    <input 
                      type="number" 
                      min="0"
                      value={months || ''} 
                      onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-20 text-sm font-bold text-gray-700">Days</label>
                    <input 
                      type="number" 
                      min="0"
                      value={days || ''} 
                      onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {years > 0 || months > 0 || days > 0 ? (
                  <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-3 mb-6">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                      This will add {((years * 365) + (months * 30) + days).toLocaleString()} to every prayer's Qaza count.
                    </p>
                  </div>
                ) : null}
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCalculator(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={calculateMissed}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    Add Qaza
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

export function KhatamQuranView({ setView }: { setView: (v: string) => void }) {
  const [completedParahs, setCompletedParahs] = useLocalStorage<number[]>("khatam_quran_progress", []);
  
  const toggleParah = (parahNum: number) => {
    setCompletedParahs(prev => 
      prev.includes(parahNum) 
        ? prev.filter(p => p !== parahNum)
        : [...prev, parahNum]
    );
  };

  const progressPercentage = Math.round((completedParahs.length / 30) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col bg-gray-50"
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setView('Quran')}
          className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Khatam-e-Quran</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Your Progress</h2>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-extrabold text-[#df4b4b]">{progressPercentage}%</span>
          <span className="text-sm text-gray-500 font-medium mb-1">{completedParahs.length} / 30 Parahs</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#df4b4b] rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 30 }, (_, i) => i + 1).map(parah => {
          const isCompleted = completedParahs.includes(parah);
          return (
            <button
              key={parah}
              onClick={() => toggleParah(parah)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border-b-4 ${
                isCompleted 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' 
                  : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50'
              }`}
            >
              <span className="font-bold text-lg leading-none">{parah}</span>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

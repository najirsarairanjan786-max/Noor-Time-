import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import { type ViewType } from '../App';
import { SAHIH_BUKHARI_HADEES } from '../data/hadees';

interface HadeesViewProps {
  setView: (view: ViewType) => void;
}

export function HadeesView({ setView }: HadeesViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextHadees = () => {
    setCurrentIndex((prev) => (prev + 1) % SAHIH_BUKHARI_HADEES.length);
  };

  const prevHadees = () => {
    setCurrentIndex((prev) => (prev - 1 + SAHIH_BUKHARI_HADEES.length) % SAHIH_BUKHARI_HADEES.length);
  };

  const current = SAHIH_BUKHARI_HADEES[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 w-full min-h-screen relative overflow-hidden"
    >
      {/* 3D Animated Background */}
      <div className="fixed inset-0 z-[-1] bg-[#0f172a] overflow-hidden">
        <motion.div 
          className="absolute inset-[-10%] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
          animate={{
            rotate: [0, 2, 0, -2, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]/95" />
      </div>

      <div className="pt-6 px-4 mb-4 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => setView('home')}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex flex-col items-end">
          <h1 className="text-xl font-bold text-white tracking-wide">صحيح البخاري</h1>
          <p className="text-amber-400 text-xs font-medium tracking-widest uppercase">Sahih al-Bukhari</p>
        </div>
      </div>

      <div className="px-4 max-w-lg mx-auto pb-8 pt-4 relative perspective-[1200px]">
        {/* Animated Book Image */}
        <motion.div 
          className="w-full h-48 mb-6 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          initial={{ rotateX: 15, rotateY: -10, y: 20, opacity: 0 }}
          animate={{ rotateX: 0, rotateY: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
        >
          <motion.div 
            className="absolute inset-0 bg-cover bg-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=800&auto=format&fit=crop")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold text-sm tracking-uppercase tracking-wider">Chapter {current.number}</span>
              </div>
              <h2 className="text-white text-2xl font-bold font-arabic leading-tight drop-shadow-md">{current.chapterAr}</h2>
              <p className="text-slate-300 text-sm font-medium">{current.chapterEn}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* 3D Hadith Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-50 pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold font-mono border border-amber-500/30">
                  Hadith {current.number}
                </div>
                <div className="text-slate-400 italic text-sm">
                  {current.narrator}
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right">
                <p className="font-arabic text-2xl sm:text-3xl leading-relaxed text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-bold">
                  {current.textAr}
                </p>
              </div>

              {/* Urdu translation */}
              <div className="bg-emerald-950/30 -mx-6 px-6 py-4 border-y border-white/5">
                <p className="font-arabic text-xl sm:text-2xl leading-relaxed text-emerald-200 text-right drop-shadow-md" dir="rtl">
                  {current.textUr}
                </p>
              </div>

              {/* English translation */}
              <div>
                <p className="text-slate-300 text-[15px] leading-relaxed font-medium">
                  {current.textEn}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button 
            onClick={prevHadees}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all active:scale-90 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="text-slate-400 font-mono text-sm tracking-wider tabular-nums font-bold">
            {currentIndex + 1} / {SAHIH_BUKHARI_HADEES.length}
          </div>

          <button 
            onClick={nextHadees}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all active:scale-90 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

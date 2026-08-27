import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sunrise, Sunset, Play, Pause, ChevronLeft } from "@/src/lib/icons";
import { type ViewType } from '../App';

interface AdhkarViewProps {
  setView: (view: ViewType) => void;
}

const CATEGORIES = [
  { id: 'morning', label: 'أذكار الصباح', labelEn: 'Morning Adhkar', icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-100/50' },
  { id: 'evening', label: 'أذكار المساء', labelEn: 'Evening Adhkar', icon: Sunset, color: 'text-indigo-500', bg: 'bg-indigo-100/50' },
];

const ADHKAR_ITEMS: Record<string, { id: string; text: string; translation: string; audio: string }[]> = {
  morning: [
    { 
      id: 'm1', 
      text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ', 
      translation: 'We have entered a new day and with it all dominion is Allah\'s.',
      audio: ''
    },
    { 
      id: 'm2', 
      text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا', 
      translation: 'O Allah, by You we enter the morning and by You we enter the evening.',
      audio: ''
    },
    {
      id: 'm3',
      text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      translation: 'In the Name of Allah with Whose Name there is protection against every kind of harm in the earth or in the heaven.',
      audio: ''
    }
  ],
  evening: [
    { 
      id: 'e1', 
      text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', 
      translation: 'We have entered the evening and with it all dominion is Allah\'s.',
      audio: ''
    },
    { 
      id: 'e2', 
      text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا', 
      translation: 'O Allah, by You we enter the evening and by You we enter the morning.',
      audio: ''
    },
    {
      id: 'e3',
      text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      translation: 'In the Name of Allah with Whose Name there is protection against every kind of harm in the earth or in the heaven.',
      audio: ''
    }
  ]
};

export function AdhkarView({ setView }: AdhkarViewProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // In a real app, logic to play audio file would go here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-[100dvh] bg-[#f8f9fb] flex flex-col items-center"
      dir="ltr"
    >
      <div className="w-full max-w-md bg-[#f8f9fb] min-h-[100dvh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-[#f8f9fb] sticky top-0 z-10 w-full">
          <button
            onClick={() => {
              if (currentCategory) {
                setCurrentCategory(null);
                setPlayingId(null);
              } else {
                setView('home');
              }
            }}
            className="w-10 h-10 flex items-center justify-center text-[#2a3052] active:bg-slate-200 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-[#2a3052]">
            {currentCategory === 'morning' ? CATEGORIES[0].labelEn : currentCategory === 'evening' ? CATEGORIES[1].labelEn : 'Daily Adhkar'}
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 z-0">
          <AnimatePresence mode="wait">
            {!currentCategory ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-5 transition-transform active:scale-[0.98] hover:shadow-md w-full text-left"
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg}`}>
                        <Icon className={`w-7 h-7 ${cat.color}`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-[#2a3052] font-arabic mb-1" dir="rtl">{cat.label}</h2>
                        <p className="text-sm font-medium text-slate-500">{cat.labelEn}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="adhkar-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 pb-8"
              >
                {ADHKAR_ITEMS[currentCategory]?.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100/80 p-5 pl-6 flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/80 rounded-l-3xl"></div>
                    
                    <p className="text-[22px] leading-[2.2] font-arabic text-[#2a3052] text-right drop-shadow-sm mb-4" dir="rtl">
                      {item.text}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-500 font-medium mb-6">
                      {item.translation}
                    </p>
                    
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplication {index + 1}</span>
                      <button
                        onClick={() => togglePlay(item.id)}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                          playingId === item.id 
                            ? 'bg-emerald-50 text-emerald-600 shadow-inner' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 active:bg-slate-200'
                        }`}
                      >
                        {playingId === item.id ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

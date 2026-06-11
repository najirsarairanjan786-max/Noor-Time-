import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { type ViewType } from '../App';

interface TajweedViewProps {
  setView: (view: ViewType) => void;
}

const CATEGORIES = [
  { id: 'namaz', label: 'نماز' },
  { id: 'dua', label: 'دُعا' },
  { id: 'saved', label: 'محفوظ چیزیں' },
];

const NAMAZ_ITEMS = [
  { id: 'takbeer', label: 'تکبیر تحریمہ', audio: '' },
  { id: 'sanaa', label: 'ثناء', audio: '' },
  { id: 'taawwuz', label: 'تعوذ', audio: '' },
  { id: 'tasmiyah', label: 'تسمیہ', audio: '' },
  { id: 'fatihah', label: 'سورۃ الفاتحہ', audio: '' },
  { id: 'ikhlas', label: 'سورۃ الاخلاص', audio: '' },
  { id: 'ruku', label: 'تسبیح رکوع', audio: '' },
  { id: 'tasmeeh', label: 'تسمیع', audio: '' },
  { id: 'tahmeed', label: 'تحمید', audio: '' },
  { id: 'sajdah', label: 'تسبیح سجدہ', audio: '' },
  { id: 'attahiyat', label: 'التحیات', audio: '' },
  { id: 'durood', label: 'درود ابراہیمی', audio: '' },
  { id: 'masura', label: 'دعائے ماثورہ', audio: '' },
  { id: 'salam', label: 'سلام', audio: '' },
];

export function TajweedView({ setView }: TajweedViewProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // In a real app, play audio here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full min-h-[100dvh] bg-[#f8f9fb] flex flex-col items-center"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-[#f8f9fb] min-h-[100dvh] flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-[#f8f9fb] sticky top-0 z-10" dir="ltr">
          <div className="w-8"></div>
          <h1 className="text-[20px] font-bold text-[#2a3052] font-arabic">
            {currentCategory === 'namaz' ? 'نماز' : currentCategory === 'dua' ? 'دُعا' : currentCategory === 'saved' ? 'محفوظ چیزیں' : 'تجوید'}
          </h1>
          <button
            onClick={() => {
              if (currentCategory) {
                setCurrentCategory(null);
                setPlayingId(null);
              } else {
                setView('home');
              }
            }}
            className="w-8 h-8 flex items-center justify-center text-[#2a3052] hover:bg-slate-200 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 bg-[#f8f9fb] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!currentCategory ? (
              /* Categories Grid */
              <motion.div
                key="categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategory(cat.id)}
                    className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col items-center justify-center min-h-[120px] transition-transform active:scale-95 hover:shadow-md"
                  >
                    <span className="text-xl font-arabic text-[#2a3052]">{cat.label}</span>
                  </button>
                ))}
              </motion.div>
            ) : currentCategory === 'namaz' ? (
              /* Namaz List */
              <motion.div
                key="namaz-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] box-border overflow-hidden pb-4"
              >
                {NAMAZ_ITEMS.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-5 py-4 ${index !== NAMAZ_ITEMS.length - 1 ? 'border-b border-gray-100/80' : ''}`}
                  >
                    <span className="text-[19px] font-arabic text-[#2a3052] pt-1">{item.label}</span>
                    <button
                      onClick={() => togglePlay(item.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent active:bg-slate-100 text-[#2a3052] transition-colors"
                    >
                      {playingId === item.id ? (
                        <Pause className="w-[18px] h-[18px] text-[#2a3052]" />
                      ) : (
                        <Play className="w-[18px] h-[18px] text-[#2a3052]" />
                      )}
                    </button>
                  </div>
                ))}
              </motion.div>
            ) : (
              /* Placeholders for others */
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-40"
              >
                <p className="text-slate-500 font-arabic text-lg">جلد آ رہا ہے...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

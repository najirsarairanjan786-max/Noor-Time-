import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Share2, FileText, CheckCircle2, Circle } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'daily' | string;

interface DailyViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
}

export function DailyView({ setView }: DailyViewProps) {
  const [salahStatus, setSalahStatus] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('dailySalahTracker');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString()) {
          return parsed.status || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
        }
      } catch {
        // Ignored
      }
    }
    return { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
  });

  useEffect(() => {
    localStorage.setItem('dailySalahTracker', JSON.stringify({
      date: new Date().toDateString(),
      status: salahStatus
    }));
  }, [salahStatus]);

  const toggleSalah = (prayer: string) => {
    setSalahStatus(prev => ({ ...prev, [prayer]: !prev[prayer] }));
  };

  const handleShare = (title: string, text: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: window.location.href,
      }).catch((error) => {
        if (error.name !== 'AbortError' && !error.message?.includes('canceled')) {
          console.error('Error sharing:', error);
        }
      });
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 w-full max-w-md mx-auto min-h-[100dvh] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView('home')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">Daily</h1>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto pb-10">
        
        {/* Daily Salah Tracker */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-slate-100 flex flex-col p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h2 className="text-[20px] font-bold text-slate-800 tracking-tight">Daily Salah</h2>
            <span className="text-[12px] font-bold text-[#7da65e] bg-[#edf6e9] px-2.5 py-1 rounded-full uppercase tracking-wider">Tracker</span>
          </div>
          <div className="flex items-center gap-2 justify-between">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
              const isCompleted = salahStatus[prayer];
              return (
                <button
                  key={prayer}
                  onClick={() => toggleSalah(prayer)}
                  className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
                >
                  <div className={`w-[3.25rem] h-[3.25rem] rounded-[18px] flex items-center justify-center transition-colors ${isCompleted ? 'bg-[#7da65e] text-white shadow-sm' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 border border-slate-100'}`}>
                    {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                  </div>
                  <span className={`text-[12px] font-bold ${isCompleted ? 'text-[#7da65e]' : 'text-slate-500'}`}>{prayer}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ayat OF THE DAY */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-slate-100 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              <BookOpen className="w-9 h-9 text-[#f19a9a]" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="text-[26px] font-extrabold text-slate-800 tracking-tight leading-none mb-0.5">Ayat</span>
                <span className="text-[12px] font-bold text-slate-900 tracking-wider">OF THE DAY</span>
              </div>
            </div>
            <button 
              onClick={() => handleShare('Ayat of the Day', 'Check out this Ayat of the Day from the app!')}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Share2 className="w-6 h-6 text-slate-800" strokeWidth={2} />
            </button>
          </div>
          
          {/* Main Content */}
          <div className="relative w-full h-[400px] overflow-hidden bg-[#dabd9b] flex items-center justify-center">
            {/* Background elements to mimic the desert & arch */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#e5d0b9] to-[#cba882]" />
            <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[#c59d72] to-transparent z-10" />
            
            {/* Arch Shape */}
            <div className="relative w-[90%] h-[90%] bg-gradient-to-b from-[#704627] to-[#8d5b35] rounded-t-full shadow-2xl z-20 flex flex-col items-center pt-10 px-4 text-center border-t-2 border-x-2 border-white/10">
              <div className="text-white drop-shadow-md pb-4 border-b border-white/20 w-[80%] mb-4">
                <p className="text-[28px] font-bold leading-normal text-[#fdefdc]" dir="rtl">
                  وَ اَنْزَلَ اللّٰهُ عَلَيْكَ الْكِتٰبَ وَ الْحِكْمَةَ وَ عَلَّمَكَ مَا لَمْ تَكُنْ تَعْلَمُ
                </p>
                <p className="text-[16px] mt-2 font-medium text-[#e3c7a6]">(النساء:113)</p>
              </div>
              <p className="text-[14px] font-bold text-[#23150d] mb-2 z-30 bg-[#c79c6d] px-3 py-1 rounded-full shadow-sm drop-shadow-sm">ترجمہ کنزالعرفان</p>
              <p className="text-[18px] font-medium leading-relaxed text-white drop-shadow-md z-30" dir="rtl">
                اور اللہ نے آپ پر کتاب اور حکمت نازل فرمائی اور آپ کو وہ سب کچھ سکھا دیا جو آپ نہ جانتے تھے۔
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-5 py-4 bg-white">
            <button onClick={() => window.open('https://quran.com', '_blank')} className="text-[#bf5c5c] font-medium text-[15px] hover:underline">Read more</button>
          </div>
        </div>

        {/* Hadees OF THE DAY */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-slate-100 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              {/* Custom Mosque Icon approximation using basic shapes/Lucide */}
              <div className="w-9 h-9 relative flex items-end justify-center text-[#f19a9a]">
                <div className="w-6 h-6 bg-[#f19a9a] rounded-t-full relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#f19a9a]" />
                  <div className="absolute -left-2 bottom-0 w-2 h-4 bg-[#f19a9a] rounded-t-sm" />
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[26px] font-extrabold text-slate-800 tracking-tight leading-none mb-0.5">Hadees</span>
                <span className="text-[12px] font-bold text-slate-900 tracking-wider">OF THE DAY</span>
              </div>
            </div>
            <button 
              onClick={() => handleShare('Hadees of the Day', 'Check out this Hadees of the Day from the app!')}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Share2 className="w-6 h-6 text-slate-800" strokeWidth={2} />
            </button>
          </div>
          
          {/* Main Content */}
          <div className="relative w-full h-[500px] overflow-hidden bg-slate-100 flex flex-col">
            <img src="https://images.unsplash.com/photo-1565552645632-d725e8bfc19a?auto=format&fit=crop&q=80&w=600" alt="Kaaba" className="absolute right-0 top-0 w-[60%] h-full object-cover opacity-90 object-right" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/80 z-10" />
            
            <div className="relative z-20 w-[65%] h-full bg-white/40 backdrop-blur-[2px] p-4 flex flex-col items-center justify-center text-center shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-r border-white/50 rounded-r-[3rem] my-4 ml-2">
              <div className="border border-[#758469]/30 rounded-t-full rounded-b-xl p-4 h-full flex flex-col items-center justify-center bg-white/60">
                 <h3 className="text-[24px] font-bold text-[#006e89] mb-4 drop-shadow-sm font-serif" dir="rtl">فرمانِ مصطفیٰ <span className="text-[12px] text-slate-500">ﷺ</span></h3>
                 <p className="text-[18px] font-bold text-[#9d5c2e] mb-2" dir="rtl">دو چتکبرے</p>
                 <p className="text-[15px] leading-relaxed text-[#166534] font-medium" dir="rtl">
                   رسول اللہ صلی اللہ علیہ وسلم نے سینگ والے بکروں کی قربانی کی کہ انہیں اپنے ہاتھ سے <span className="font-bold text-[#c7823f]">ذبح</span> کیا، بسم اللہ و تکبیر کہی، فرمایا کہ میں نے آپ کو ان بکروں کی کروٹوں پر اپنا <span className="font-bold text-[#c7823f]">قدم</span> رکھے دیکھا، آپ فرماتے تھے: <span className="text-[18px] font-bold block mt-2 text-[#7f5130]">بسم اللہ واللہ اکبر۔</span>
                 </p>
                 <p className="text-[10px] mt-4 text-slate-600 font-medium" dir="rtl">
                  (مراۃ المناجیح، 2/366، حدیث: 1453، بخاری، 3/575، حدیث: 5558)
                 </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-5 py-4 bg-white flex justify-between items-center">
            <button onClick={() => window.open('https://sunnah.com', '_blank')} className="text-[#bf5c5c] font-medium text-[15px] hover:underline">Read more</button>
          </div>
        </div>

        {/* Fatwa OF THE DAY */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-slate-100 flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              <FileText className="w-9 h-9 text-[#f19a9a]" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="text-[26px] font-extrabold text-slate-800 tracking-tight leading-none mb-0.5">Fatwa</span>
                <span className="text-[12px] font-bold text-slate-900 tracking-wider">OF THE DAY</span>
              </div>
            </div>
            <button 
              onClick={() => handleShare('Fatwa of the Day', 'Check out this Fatwa of the Day from the app!')}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Share2 className="w-6 h-6 text-slate-800" strokeWidth={2} />
            </button>
          </div>
          
          {/* Main Content */}
          <div className="relative w-full h-[350px] overflow-hidden bg-gradient-to-b from-[#e9dec7] to-[#fac28d] flex items-center justify-center flex-col p-6 text-center">
             <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center mix-blend-overlay"></div>
             
             <div className="relative z-20 flex flex-col items-center drop-shadow-xl h-full justify-start pt-6">
               <h3 className="text-[32px] font-extrabold text-[#472d1a]" dir="rtl">
                 اگر <span className="text-[#5c2b18]">مالدار</span> شخص
               </h3>
               <h4 className="text-[36px] font-black text-[#5c2b18] mt-2 mb-2">
                 12 ذوالحجہ<span className="text-[26px] text-[#472d1a] font-bold"> کو سفر پر ہو تو</span>
               </h4>
               <h5 className="text-[28px] font-bold text-[#472d1a] mt-1">قربانی کا حکم</h5>
             </div>
             
             {/* Decorative airplane & animals representation (using generic images or CSS for now) */}
             <div className="absolute bottom-0 w-full h-[150px] flex justify-center items-end opacity-90 pb-4">
                <div className="flex text-6xl drop-shadow-2xl gap-2 z-20">
                  🐄 🐪 🐐 🐏
                </div>
                <div className="absolute text-[120px] text-slate-800/10 -rotate-12 bottom-0 z-10 font-sans">
                  ✈️
                </div>
             </div>
          </div>
          
          {/* Footer */}
          <div className="px-5 py-4 bg-white">
            <button onClick={() => window.open('https://daruliftaahlesunnat.net/', '_blank')} className="text-[#bf5c5c] font-medium text-[15px] hover:underline">Read more</button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

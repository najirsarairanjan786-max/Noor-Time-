import { motion } from 'motion/react';
import { ViewType } from '../App';
import { Share2, BookOpen, VolumeX, Compass, CalendarCheck } from 'lucide-react';

interface ShareViewProps {
  setView: (view: ViewType) => void;
}

export function ShareView({ setView }: ShareViewProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Prayer Times App',
        text: 'Check out this amazing Prayer Times app!',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback
      alert('Sharing is not supported on this browser.');
    }
  };

  const features = [
    { icon: <BookOpen className="w-[20px] h-[20px] text-[#df4b4b]" />, label: 'Al Quran' },
    { icon: <VolumeX className="w-[20px] h-[20px] text-[#df4b4b]" />, label: 'Jamat Silent Mode' },
    { icon: <Compass className="w-[20px] h-[20px] text-[#df4b4b]" />, label: 'Qibla Direction' },
    { icon: <div className="w-[22px] h-[22px] text-[#df4b4b] border-[1.5px] border-[#df4b4b] rounded-full flex items-center justify-center"><div className="w-2.5 h-2.5 bg-[#df4b4b] rounded-full mt-1.5" /></div>, label: 'Qaza Prayer Calculation' },
    { icon: <div className="w-[20px] h-[20px] text-[#df4b4b] border-[1.5px] border-[#df4b4b] rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-[#df4b4b] rounded-[2px] transform rotate-45" /></div>, label: 'Tasbih (Counter)' },
    { icon: <CalendarCheck className="w-[20px] h-[20px] text-[#df4b4b]" />, label: 'Hijri Calendar' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setView('home')}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[16px] w-[340px] max-w-full overflow-hidden flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with implicit Mosque Design */}
        <div className="bg-gradient-to-r from-[#ffe4c4] to-[#fec998] relative h-[110px] overflow-hidden flex flex-col justify-center px-5">
           {/* Decorative Mosque shapes */}
           <div className="absolute right-0 bottom-0 text-[#e65100] flex items-end">
             {/* Palm Tree */}
             <div className="mr-8 mb-2 z-20">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="#d9723a">
                 <path d="M12 22C11 20 10.5 16 11.5 14C12 13 13 12 14 12C12 12 10 13 9 14.5C9.5 12 11 10 13 9C10.5 9 8 10 7 12.5C8 10.5 10 8 11.5 7C9.5 7 7 8 6 10C7.5 8 9 6.5 11 6C10 6 8.5 7 7.5 8.5C9.5 6 11 4 12.5 3C12.5 5 11.5 6.5 10.5 8C13 5 15 3.5 16.5 2C16.5 4 15.5 6.5 13.5 8.5C15 7 17 6 18.5 6C17.5 8 16 9 14 10C16 9 18 8.5 19.5 9C18 10.5 16 11.5 13.5 12C15.5 11.5 17 12 18 13" fill="#d9723a" />
               </svg>
             </div>
             
             {/* Mosques Building */}
             <div className="flex items-end right-[-10px] relative">
               {/* Left small dome */}
               <div className="w-[30px] h-[55px] bg-[#f9a67a] relative z-10">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f9a67a] rounded-t-full"></div>
               </div>
               
               {/* Center large dome */}
               <div className="w-[60px] h-[75px] bg-[#f07b46] relative z-20 -ml-2 rounded-t-sm">
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[40px] h-[34px] bg-[#f07b46] rounded-t-full"></div>
                 <div className="absolute -top-[30px] left-1/2 -translate-x-1/2 text-[10px] text-[#f07b46]">☪</div>
                 <div className="flex gap-1 absolute bottom-2 left-1/2 -translate-x-1/2">
                   <div className="w-1.5 h-6 bg-[#ba491a] rounded-t-full"></div>
                   <div className="w-1.5 h-6 bg-[#ba491a] rounded-t-full"></div>
                   <div className="w-1.5 h-6 bg-[#ba491a] rounded-t-full"></div>
                 </div>
               </div>
               
               {/* Right minaret */}
               <div className="w-[12px] h-[85px] bg-[#d55e2d] relative z-10 -ml-1">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[16px] h-3 bg-[#d55e2d] rounded-t-full"></div>
                 <div className="absolute top-2 w-[16px] -left-[2px] h-1.5 bg-[#ba491a]"></div>
               </div>
               
               {/* Ground shadow/dunes */}
               <div className="absolute bottom-0 w-[200px] right-[-20px] h-5 bg-[#c25424] opacity-80 rounded-t-[100%] z-30"></div>
             </div>
           </div>

           <div className="z-30 text-black w-[150px]">
              <h2 className="text-[20px] font-bold leading-tight">Prayer Times</h2>
              <h2 className="text-[20px] font-bold leading-[1.1]">Share Card</h2>
           </div>
        </div>

        {/* Feature List (White Background) */}
        <div className="px-6 py-5 flex flex-col gap-[14px] bg-white relative z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center border border-[#df4b4b] bg-white shrink-0">
                {feat.icon}
              </div>
              <div className="flex flex-col relative w-full pt-1">
                 <span className="font-extrabold text-black text-[16px] tracking-tight leading-none">{feat.label}</span>
                 {idx === 3 && (
                   <span className="text-black font-extrabold text-[16px] leading-[1.1] mt-0.5">Calculation</span>
                 )}
              </div>
            </div>
          ))}
        </div>

        {/* Department Text & Icons */}
        <div className="text-center pt-3 pb-6 bg-white border-t border-dashed border-gray-200 mx-5 mt-2">
          <p className="font-extrabold text-black text-[13px] tracking-tight mt-2 pb-1">IT Department of Dawat-e-Islami</p>
          
          {/* Simulated mini app icons row */}
          <div className="flex justify-center gap-1.5 mt-2">
             <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center text-white bg-[#008f82] shadow-sm overflow-hidden">
                <span className="text-[7px] font-bold leading-none mt-1">صِرَاطِ</span>
                <span className="text-[6px] font-bold leading-none">الْجِنَان</span>
             </div>
             
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="w-[18px] h-[12px] bg-red-600 rounded-t-full absolute bottom-1"></div>
                <div className="w-[20px] h-2 bg-red-800 rounded-t-md absolute bottom-0"></div>
                <div className="w-1 h-3 bg-red-600 absolute right-1 bottom-1 rounded-t-sm"></div>
                <div className="w-1 h-3 bg-red-600 absolute left-1 bottom-1 rounded-t-sm"></div>
             </div>
             
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#dff0d8] border border-green-200 shadow-sm text-green-800 text-[10px] font-bold">
                 📖
             </div>
             
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 border-2 border-yellow-500 shadow-sm text-yellow-500 font-bold text-[14px]">
                 Z
             </div>
             
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#3c9053] shadow-sm text-white">
                 🕌
             </div>
             
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#514371] shadow-sm text-white text-[12px] overflow-hidden relative">
                 <div className="w-4 h-4 border border-white rounded-full absolute bottom-1"></div>
                 <div className="w-[1px] h-2 bg-white absolute top-1"></div>
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6 pt-1 flex justify-center bg-white relative z-0">
          <button 
            onClick={handleShare}
            className="bg-[#e4534f] hover:bg-[#d6413d] text-white rounded-[10px] py-[10px] flex flex-col items-center justify-center transition-colors shadow-md w-full max-w-[200px] active:scale-95 relative z-10"
          >
            <Share2 className="w-[20px] h-[20px] mb-0.5" strokeWidth={2.5} />
            <span className="font-extrabold text-[15px] tracking-tight">Share</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

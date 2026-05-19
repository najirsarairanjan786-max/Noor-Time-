import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, CalendarDays, BookOpen, Clock, MoonStar } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'daily' | string;

export function Navigation({ view, setView }: { view: ViewType, setView: Dispatch<SetStateAction<ViewType>> }) {
  const TABS = [
    { id: 'home', icon: MoonStar, label: 'Rohani Ilaj' },
    { id: 'prayer', icon: BookOpen, label: 'Tajweed' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'daily', icon: Clock, label: 'Daily' },
  ];

  const activeIndex = TABS.findIndex(t => t.id === view) === -1 ? 0 : TABS.findIndex(t => t.id === view);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[96px] z-50">
      {/* Background Mask */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-[2.5rem] shadow-[0_-5px_40px_rgba(0,0,0,0.1)] bg-transparent">
        <motion.div 
          className="absolute top-0 bottom-0 pointer-events-auto"
          style={{ 
            left: 0, 
            width: '300%',
            transformOrigin: 'center'
          }}
          initial={false}
          animate={{ x: `calc(${(activeIndex + 0.5) * (100 / 15)}% - 50%)` }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
        >
          {/* Left Block */}
          <div className="absolute top-0 bottom-0 left-0 right-[calc(50%+48px)] bg-white" />
          
          {/* Center Cutout */}
          <div className="absolute top-0 bottom-0 left-[calc(50%-48px)] w-[96px]">
            <svg width="96" height="48" viewBox="0 0 96 48" className="absolute top-0 left-0 right-0">
              <path d="M0,0 C24,0 24,46 48,46 C72,46 72,0 96,0 V48 H0 Z" fill="white" />
            </svg>
            <div className="absolute top-[47px] bottom-0 left-0 right-0 bg-white" />
          </div>

          {/* Right Block */}
          <div className="absolute top-0 bottom-0 left-[calc(50%+48px)] right-0 bg-white" />
        </motion.div>
      </div>

      {/* Foreground Tabs */}
      <div className="relative w-full h-full flex items-center pointer-events-auto px-2 sm:px-0">
        {TABS.map((tab, i) => {
          const isActive = activeIndex === i;
          return (
            <div 
              key={tab.id} 
              className="flex-1 h-full relative cursor-pointer flex justify-center hover:bg-slate-50/50 transition-colors" 
              onClick={() => setView(tab.id)}
            >
               {/* Bubble Layer */}
               {isActive && (
                  <motion.div 
                    layoutId="bubble"
                    className="absolute w-[68px] h-[68px] bg-[#c83271] rounded-full shadow-[0_8px_16px_rgba(200,50,113,0.4)] z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    style={{ top: "-34px" }}
                  />
               )}
               
               {/* Icon Layer */}
               <motion.div 
                 initial={false}
                 animate={{ 
                   y: isActive ? -34 : 16, 
                 }}
                 transition={{ type: "spring", stiffness: 350, damping: 35 }}
                 className="absolute top-[0px] z-20 w-[68px] h-[68px] flex flex-col items-center justify-center"
               >
                  <tab.icon 
                     className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-800'}`} 
                     strokeWidth={isActive ? 2.5 : 2}
                     size={38}
                  />
               </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

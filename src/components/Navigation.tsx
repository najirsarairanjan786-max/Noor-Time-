import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, CalendarDays, BookOpen, Clock, MoonStar, UserCircle } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../lib/i18n';
import { useAuth } from '../hooks/useAuth';
import { FeedbackModal } from './FeedbackModal';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'daily' | string;

export function Navigation({ view, setView }: { view: ViewType, setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const { user } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const TABS = [
    { id: 'home', icon: MoonStar, label: t('home') },
    { id: 'prayer', icon: BookOpen, label: t('tajweed') },
    { id: 'calendar', icon: CalendarDays, label: t('calendar') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
    { id: 'daily', icon: Clock, label: t('more') },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  const activeIndex = TABS.findIndex(t => t.id === view) === -1 ? 0 : TABS.findIndex(t => t.id === view);

  const handlePointerDown = (id: string) => {
    if (id === 'settings') {
      longPressTimer.current = setTimeout(() => {
        setShowFeedbackModal(true);
        longPressTimer.current = null;
      }, 600); // 600ms for long press
    }
  };

  const clearTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer(); // Cleanup on unmount
  }, []);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[72px] z-50">
        {/* Background Mask */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-[2rem] shadow-[0_-5px_40px_rgba(0,0,0,0.1)] bg-transparent">
          <motion.div 
            className="absolute top-0 bottom-0 pointer-events-auto"
            style={{ 
              left: 0, 
              width: '300%',
              transformOrigin: 'center'
            }}
            initial={false}
            animate={{ x: `calc(${(activeIndex + 0.5) * (100 / 18)}% - 50%)` }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          >
            {/* Left Block */}
            <div className="absolute top-0 bottom-0 left-0 right-[calc(50%+36px)] bg-white" />
            
            {/* Center Cutout */}
            <div className="absolute top-0 bottom-0 left-[calc(50%-36px)] w-[72px]">
              <svg width="72" height="36" viewBox="0 0 72 36" className="absolute top-0 left-0 right-0">
                <path d="M0,0 C18,0 18,34 36,34 C54,34 54,0 72,0 V36 H0 Z" fill="white" />
              </svg>
              <div className="absolute top-[35px] bottom-0 left-0 right-0 bg-white" />
            </div>

            {/* Right Block */}
            <div className="absolute top-0 bottom-0 left-[calc(50%+36px)] right-0 bg-white" />
          </motion.div>
        </div>

        {/* Foreground Tabs */}
        <div className="relative w-full h-full flex items-center pointer-events-auto px-2 sm:px-0">
          {TABS.map((tab, i) => {
            const isActive = activeIndex === i;
            return (
              <div 
                key={tab.id} 
                className="flex-1 h-full relative cursor-pointer flex justify-center hover:bg-slate-50/50 transition-colors select-none" 
                onClick={() => {
                  // Only navigate if we didn't just trigger long-press (or if we don't care, we can navigate anyway)
                  setView(tab.id);
                }}
                onPointerDown={() => handlePointerDown(tab.id)}
                onPointerUp={clearTimer}
                onPointerLeave={clearTimer}
                onPointerCancel={clearTimer}
              >
                 {/* Bubble Layer */}
                 {isActive && (
                    <motion.div 
                      layoutId="bubble"
                      className="absolute w-[50px] h-[50px] bg-[#c83271] rounded-full shadow-[0_8px_16px_rgba(200,50,113,0.4)] z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      style={{ top: "-25px" }}
                    />
                 )}
                 
                 {/* Icon Layer */}
                 <motion.div 
                   initial={false}
                   animate={{ 
                     y: isActive ? -25 : 12, 
                   }}
                   transition={{ type: "spring", stiffness: 350, damping: 35 }}
                   className="absolute top-[0px] z-20 w-[50px] h-[50px] flex flex-col items-center justify-center"
                 >
                    {tab.id === 'profile' && user?.photoURL ? (
                      <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-white' : 'border-slate-800'}`}>
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <tab.icon 
                         className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-800'}`} 
                         strokeWidth={isActive ? 2.5 : 2}
                         size={24}
                      />
                    )}
                 </motion.div>
              </div>
            );
          })}
        </div>
      </div>
      
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, MessageCircle, Settings, Globe, HeartHandshake, MapPin, 
  Cloud, Calculator, Compass, VolumeX, CalendarDays, Heart, Share2,
  Lightbulb, CalendarCheck, Radio, Star, Bell, Mail, Smartphone, ThumbsUp, X,
  BookA, Bookmark, BookText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../lib/i18n';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'languages' | string;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setView: Dispatch<SetStateAction<ViewType>>;
}

export function Sidebar({ isOpen, onClose, setView }: SidebarProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { settings } = useSettings();
  const { t, isRTL } = useTranslation(settings.language);

  const menuItems = [
    { icon: BookOpen, label: t('alQuran') || 'Al Quran', view: 'Quran' as ViewType, color: 'text-pink-400' },
    { icon: BookA, label: t('tajweed') || 'Tajweed', color: 'text-yellow-500' },
    { icon: BookText, label: t('hadees') || 'Hadees', color: 'text-orange-400' },
    { icon: MessageCircle, label: t('qa') || 'Question and Answer', color: 'text-amber-500' },
    { icon: Settings, label: t('settings') || 'Settings', view: 'settings' as ViewType, color: 'text-red-500' },
    { icon: Globe, label: t('languages') || 'Languages', view: 'languages' as ViewType, color: 'text-blue-400' },
    { icon: HeartHandshake, label: t('donate') || 'Donate Us', view: 'donate' as ViewType, color: 'text-fuchsia-400' },
    { icon: MapPin, label: t('location') || 'Location Options', view: 'settings' as ViewType, color: 'text-yellow-400' },
    { icon: Cloud, label: t('sync') || 'Sync To Drive', color: 'text-green-500' },
    { icon: Calculator, label: t('qazaCalculator') || 'Qaza Namaz Calculator', color: 'text-blue-500' },
    { icon: Compass, label: t('qiblaDirection') || 'Qibla Direction', view: 'qibla' as ViewType, color: 'text-cyan-400' },
    { icon: VolumeX, label: t('silentMode') || 'Silent Mode', isSilentMode: true, color: 'text-purple-400' },
    { icon: CalendarDays, label: t('monthlyPrayerTimes') || 'Monthly Prayer Times', view: 'calendar' as ViewType, color: 'text-emerald-500' },
    { icon: Heart, label: t('rohaniIlaj') || 'Rohani Ilaj', color: 'text-yellow-500' },
    { icon: Star, label: t('tasbih') || 'Tasbih', color: 'text-green-600' },
    { icon: Lightbulb, label: t('inspiration') || 'Inspiration', color: 'text-orange-500' },
    { icon: CalendarCheck, label: t('hijriCalendar') || 'Hijri Calendar', view: 'calendar' as ViewType, color: 'text-fuchsia-500' },
    { icon: Radio, label: t('madaniRadio') || 'Madani Radio', color: 'text-orange-500' },
    { icon: Bookmark, label: t('favoritePost') || 'Favorite Post', color: 'text-slate-400' },
    { icon: Bell, label: t('notification') || 'Notification', color: 'text-indigo-400' },
    { icon: Mail, label: t('contactUs') || 'Contact Us', color: 'text-red-400' },
    { icon: Smartphone, label: t('moreApps') || 'More Apps', color: 'text-orange-600' },
    { icon: Share2, label: t('share') || 'Share', view: 'share' as ViewType, color: 'text-yellow-400' },
    { icon: ThumbsUp, label: t('submitReview') || 'Submit Review', color: 'text-emerald-400' },
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.view) {
      setView(item.view);
      onClose();
    } else {
      setToastMsg(`${item.label} is coming soon!`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-emerald-950 z-[101] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 bg-emerald-900/50 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white tracking-wide">PrayerTimes</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-emerald-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Menu List */}
            <div className="flex-1 overflow-y-auto py-4 pl-4 pr-2 custom-scrollbar pb-24 relative">
              <div className="space-y-1">
                {menuItems.map((item, index) => (
                  <button 
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group active:scale-95 transition-transform", 
                      isRTL && "flex-row-reverse text-right",
                      item.isSilentMode ? "hover:bg-rose-900/40 text-rose-300/80" : "hover:bg-emerald-800/40 text-emerald-100"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      item.color || (item.isSilentMode ? "text-rose-400 group-hover:text-rose-300" : "text-emerald-500 group-hover:text-emerald-300")
                    )} />
                    <span className="font-medium text-[15px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
              {toastMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-4 right-4 bg-emerald-800 text-white shadow-xl rounded-xl p-3 text-sm text-center font-medium border border-emerald-600/50"
                >
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

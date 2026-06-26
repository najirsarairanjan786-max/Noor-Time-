import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, MessageCircle, Settings, Globe, HeartHandshake, MapPin, 
  Cloud, Calculator, Compass, VolumeX, CalendarDays, Heart, Share2,
  Lightbulb, CalendarCheck, Radio, Star, Bell, Mail, Smartphone, ThumbsUp, X,
  BookA, Bookmark, BookText, ArrowLeft, Sparkles, ShoppingBag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../lib/i18n';

import { useAuth } from '../hooks/useAuth';

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
  const { user, signIn, logOut } = useAuth();

  const menuItems = [
    { icon: BookOpen, label: t('alQuran') || 'Al Quran', view: 'Quran' as ViewType, color: 'text-pink-400' },
    { icon: BookA, label: t('tajweed') || 'Tajweed', color: 'text-yellow-500' },
    { icon: BookText, label: t('hadees') || 'Hadees', color: 'text-orange-400' },
    { icon: Sparkles, label: 'Chat with Noor', view: 'noor_ai' as ViewType, color: 'text-amber-400' },
    { icon: MessageCircle, label: t('qa') || 'Question and Answer', color: 'text-amber-500' },
    { icon: Settings, label: t('settings') || 'Settings', view: 'settings' as ViewType, color: 'text-red-500' },
    ...(user?.email === "naziralquran786@gmail.com" ? [{ icon: Settings, label: 'Admin Panel', action: () => window.location.href = '/admin', color: 'text-red-500' }] : []),
    { icon: Globe, label: t('languages') || 'Languages', view: 'languages' as ViewType, color: 'text-blue-400' },
    { icon: ShoppingBag, label: t('store') || 'Islamic Store', view: 'store' as ViewType, color: 'text-emerald-400' },
    { icon: HeartHandshake, label: t('donate') || 'Donate Us', view: 'donate' as ViewType, color: 'text-fuchsia-400' },
    { icon: MapPin, label: t('location') || 'Location', view: 'settings' as ViewType, color: 'text-yellow-400' },
    { icon: Cloud, label: t('sync') || 'Sync To Drive', color: 'text-green-500' },
    { icon: Calculator, label: t('qazaCalculator') || 'Qaza Namaz Calculator', color: 'text-blue-500' },
    { icon: Compass, label: t('qiblaDirection') || 'Qibla Direction', view: 'qibla' as ViewType, color: 'text-cyan-400' },
    { icon: VolumeX, label: t('silentMode') || 'Silent Mode', isSilentMode: true, color: 'text-purple-400' },
    { icon: CalendarDays, label: t('monthlyPrayerTimes') || 'Monthly Prayer Times', view: 'calendar' as ViewType, color: 'text-emerald-500' },
    { icon: Heart, label: t('rohaniIlaj') || 'Rohani Ilaj', color: 'text-yellow-500' },
    { icon: Star, label: t('tasbih') || 'Tasbih', view: 'tasbeeh' as ViewType, color: 'text-green-600' },
    { icon: Lightbulb, label: t('inspiration') || 'Inspiration', color: 'text-orange-500' },
    { icon: CalendarCheck, label: t('hijriCalendar') || 'Hijri Calendar', view: 'calendar' as ViewType, color: 'text-fuchsia-500' },
    { icon: Radio, label: t('madaniRadio') || 'Madani Radio', color: 'text-orange-500' },
    { icon: Bookmark, label: t('favoritePost') || 'Favorite Post', color: 'text-slate-400' },
    { icon: Bell, label: t('notification') || 'Notification', view: 'notifications' as ViewType, color: 'text-indigo-400' },
    { icon: Mail, label: t('contactUs') || 'Contact Us', view: 'contact' as ViewType, color: 'text-red-400' },
    { icon: Smartphone, label: t('moreApps') || 'More Apps', color: 'text-orange-600' },
    { icon: Share2, label: t('share') || 'Share', view: 'share' as ViewType, color: 'text-yellow-400' },
    { icon: ThumbsUp, label: t('submitReview') || 'Submit Review', color: 'text-emerald-400' },
  ];

  const handleItemClick = (item: any) => {
    if (item.action) {
      item.action();
      return;
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-emerald-950 z-[101] overflow-hidden flex flex-col shadow-2xl rounded-r-3xl border-r border-white/10"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Header */}
            <div className="p-6 pt-16 bg-emerald-900/50 flex flex-col items-start gap-3 relative z-10">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-white/10 transition-colors text-emerald-100 flex items-center gap-1 self-start"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="text-sm font-medium pr-2">Back</span>
              </button>

              <div className="flex flex-col gap-1 w-full pl-1 mt-2">
                <h2 className="text-2xl font-bold text-white tracking-wide">PrayerTimes</h2>
              </div>
            </div>
            
            {/* Menu List */}
            <div className="flex-1 overflow-y-auto py-4 pl-4 pr-2 custom-scrollbar pb-24 relative z-10 w-full h-full">
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
                  className="absolute bottom-8 left-4 right-4 bg-emerald-800 text-white shadow-xl rounded-xl p-3 text-sm text-center font-medium border border-emerald-600/50 z-20"
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

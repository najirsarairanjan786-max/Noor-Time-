import { motion } from 'motion/react';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { useAlarmSystem } from '../hooks/useAlarmSystem';
import { useHijriDate } from '../hooks/useHijriDate';
import { PrayerTimesList } from '../components/PrayerTimesList';
import { Sidebar } from '../components/Sidebar';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Menu, Moon, Sun, MoonStar, CheckSquare, Search, Book, HelpCircle, ShieldAlert, BadgeInfo, Home as HomeIcon, Clock } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';
import { ThemeModal } from '../components/ThemeModal';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer';

interface HomeProps {
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

export function Home({ setView }: HomeProps) {
  const { settings, setSettings, requestLocation } = useSettings();
  const { timings, loading: dataLoading } = useData(settings.location, settings.method ?? 1, settings.school ?? 1);
  const { hijriDate } = useHijriDate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Initialize Alarm System
  useAlarmSystem(timings);

  useEffect(() => {
    if (settings.autoLocation && !settings.location) {
      requestLocation().catch(console.error);
    }
  }, []);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLocationUpdate = async () => {
    try {
      await requestLocation();
    } catch (e) {
      alert("GPS location failed. Please check your browser permissions.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32 w-full min-h-screen bg-slate-50"
    >
      {/* Top Header Background Area */}
      <div className="relative pt-6 pb-20 px-4 w-full text-white">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[#2b3c5a] z-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1594145695029-bdad519e95ce?auto=format&fit=crop&q=80&w=800")' }}
          />
        </div>

        {/* Top Bar content relative to bg */}
        <div className="relative z-10 max-w-lg mx-auto">
          {/* Header row 1 */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-4 pr-2">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="pt-1 mt-[2px] hover:opacity-80 transition"
              >
                <div className="w-8 flex flex-col gap-1.5 items-end">
                   <div className="h-1 w-8 bg-white rounded-full"></div>
                   <div className="h-[3px] w-6 bg-white rounded-full"></div>
                   <div className="h-1 w-8 bg-white rounded-full"></div>
                </div>
              </button>
              <button 
                onClick={handleLocationUpdate}
                className="flex flex-col text-left hover:opacity-80 transition-opacity max-w-[200px] overflow-hidden"
              >
                <span className="font-bold text-[14px] uppercase leading-tight whitespace-nowrap text-ellipsis overflow-hidden w-full block shadow-sm shadow-black/10">
                  {settings.location?.name || "ZIR HOUSE, Md Nazir Hussain Dwarikapur, S..."}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-start mt-4">
            <button 
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-xs font-semibold transition drop-shadow-md"
            >
              <Moon className="w-4 h-4 fill-white" />
              Change Theme
            </button>
            
            <div className="flex flex-col items-end">
              <div className="text-right mb-2 text-white">
                <div className="text-2xl font-bold tracking-tight drop-shadow-md">
                  {format(time, 'hh:mm:ss a')}
                </div>
                <div className="text-xs font-medium opacity-90 drop-shadow-md mt-0.5">
                  {format(time, 'EEEE, d MMMM yyyy')}
                </div>
              </div>
              
              {hijriDate ? (
                <div className="flex items-center gap-1.5 text-[13px] font-bold drop-shadow-md">
                  <MoonStar className="w-4 h-4" />
                  <span>
                    {hijriDate.day} {hijriDate.month.en} ({hijriDate.month.ar}) {hijriDate.year}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[13px] font-bold drop-shadow-md">
                  <MoonStar className="w-4 h-4" />
                  <span>..., Zul qadah, 1447</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 relative z-20">
        <PrayerTimesList timings={timings} setView={setView} />
        
        {/* More Features Row */}
      <div className="max-w-lg mx-auto relative mt-4">
        <h3 className="text-slate-800 text-[17px] font-extrabold mb-3 px-1 relative z-10 text-shadow-sm">More Features</h3>
        
        <div className="grid grid-cols-2 gap-3 pb-8">
          {[
            { label: 'Quran', icon: <Book className="w-8 h-8 opacity-80" />, color: 'bg-purple-100 text-purple-700' },
            { label: 'Hadees', icon: <HomeIcon className="w-8 h-8 opacity-80" />, color: 'bg-orange-100 text-orange-600' },
            { label: 'Hajj Umrah', icon: <BadgeInfo className="w-8 h-8 opacity-80" />, color: 'bg-rose-100 text-rose-700' },
            { label: 'Durood Sharif', icon: <ShieldAlert className="w-8 h-8 opacity-80" />, color: 'bg-amber-100 text-amber-700' },
            { label: 'Question & Answer', icon: <HelpCircle className="w-8 h-8 opacity-80" />, color: 'bg-fuchsia-100 text-fuchsia-700' },
            { label: 'Qaza e Omri', icon: <CheckSquare className="w-8 h-8 opacity-80" />, color: 'bg-indigo-100 text-indigo-700' }
          ].map((feature, i) => (
            <button key={i} onClick={() => setView(feature.label)} className="bg-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-700 shadow-md border border-slate-100 hover:shadow-lg transition-shadow active:scale-95">
              <div className={`w-14 h-14 ${feature.color} border border-white/20 rounded-xl flex items-center justify-center shadow-inner`}>
                {feature.icon}
              </div>
              <span className="text-sm font-semibold text-center leading-tight">{feature.label}</span>
            </button>
          ))}
        </div>
      </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} setView={setView} />
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </motion.div>
  );
}


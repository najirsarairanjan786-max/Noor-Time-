import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { CalendarView } from './pages/CalendarView';
import { SettingsView } from './pages/SettingsView';
import { PrayerDetails } from './pages/PrayerDetails';
import { FeatureView } from './pages/FeatureView';
import { QuranView } from './pages/QuranView';
import { QuizView } from './pages/QuizView';
import { QiblaDirectionView } from './pages/QiblaDirectionView';
import { LanguagesView } from './pages/LanguagesView';
import { DonateView } from './pages/DonateView';
import { ShareView } from './pages/ShareView';
import { DailyView } from './pages/DailyView';
import { Home2 } from './pages/Home2';
import { Navigation } from './components/Navigation';
import { LocationPrompt } from './components/LocationPrompt';
import { AnimatePresence } from 'motion/react';
import { useSettings } from './hooks/useSettings';
import { useDataSync } from './hooks/useDataSync';

export type ViewType = 'home' | 'home2' | 'calendar' | 'settings' | 'prayer' | 'Quran' | 'Question & Answer' | 'qibla' | 'languages' | 'donate' | 'share' | 'daily' | string;

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { settings } = useSettings();
  useDataSync();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Standard views
  const standardViews = ['home', 'home2', 'calendar', 'settings', 'prayer', 'Quran', 'Question & Answer', 'qibla', 'languages', 'donate', 'share', 'daily'];
  const isFeatureView = !standardViews.includes(currentView);

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-emerald-500/30 flex justify-center">
      <main className="w-full max-w-md bg-emerald-950 min-h-[100dvh] relative overflow-hidden shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px] pointer-events-none transition-colors duration-300"></div>
        
        <AnimatePresence mode="wait">
          {currentView === 'home' && <Home setView={setCurrentView} />}
          {currentView === 'home2' && <Home2 setView={setCurrentView} />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'prayer' && <PrayerDetails />}
          {currentView === 'Quran' && <QuranView setView={setCurrentView} />}
          {currentView === 'Question & Answer' && <QuizView setView={setCurrentView} />}
          {currentView === 'qibla' && <QiblaDirectionView setView={setCurrentView} />}
          {currentView === 'languages' && <LanguagesView setView={setCurrentView} />}
          {currentView === 'donate' && <DonateView setView={setCurrentView} />}
          {currentView === 'share' && <ShareView setView={setCurrentView} />}
          {currentView === 'daily' && <DailyView setView={setCurrentView} />}
          {isFeatureView && <FeatureView title={currentView} setView={setCurrentView} />}
        </AnimatePresence>

        <LocationPrompt />
        <Navigation view={currentView} setView={setCurrentView} />
      </main>
    </div>
  );
}


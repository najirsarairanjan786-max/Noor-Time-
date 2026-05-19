import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { CalendarView } from './pages/CalendarView';
import { SettingsView } from './pages/SettingsView';
import { PrayerDetails } from './pages/PrayerDetails';
import { FeatureView } from './pages/FeatureView';
import { QuranView } from './pages/QuranView';
import { QuizView } from './pages/QuizView';
import { Navigation } from './components/Navigation';
import { AnimatePresence } from 'motion/react';
import { useSettings } from './hooks/useSettings';

export type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'Quran' | 'Question & Answer' | string;

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const { settings } = useSettings();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Standard views
  const standardViews = ['home', 'calendar', 'settings', 'prayer', 'Quran', 'Question & Answer'];
  const isFeatureView = !standardViews.includes(currentView);

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-emerald-500/30 flex justify-center">
      <main className="w-full max-w-md bg-emerald-950 min-h-[100dvh] relative overflow-hidden shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px] pointer-events-none transition-colors duration-300"></div>
        
        <AnimatePresence mode="wait">
          {currentView === 'home' && <Home setView={setCurrentView} key="home" />}
          {currentView === 'calendar' && <CalendarView key="calendar" />}
          {currentView === 'settings' && <SettingsView key="settings" />}
          {currentView === 'prayer' && <PrayerDetails key="prayer" />}
          {currentView === 'Quran' && <QuranView setView={setCurrentView} key="quran" />}
          {currentView === 'Question & Answer' && <QuizView setView={setCurrentView} key="quiz" />}
          {isFeatureView && <FeatureView title={currentView} setView={setCurrentView} key="feature" />}
        </AnimatePresence>

        <Navigation view={currentView} setView={setCurrentView} />
      </main>
    </div>
  );
}


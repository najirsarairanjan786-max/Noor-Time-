import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Home } from "./pages/Home";
import { CalendarView } from "./pages/CalendarView";
import { SettingsView } from "./pages/SettingsView";
import { PrayerDetails } from "./pages/PrayerDetails";
import { FeatureView } from "./pages/FeatureView";
import { QuranView } from "./pages/QuranView";
import { QuizView } from "./pages/QuizView";
import { HadeesView } from "./pages/HadeesView";
import { TajweedView } from "./pages/TajweedView";
import { AdhkarView } from "./pages/AdhkarView";
import { QiblaDirectionView } from "./pages/QiblaDirectionView";
import { LanguagesView } from "./pages/LanguagesView";
import { DonateView } from "./pages/DonateView";
import { ShareView } from "./pages/ShareView";
import { DailyView } from "./pages/DailyView";
import { TasbeehView } from "./pages/TasbeehView";
import { JamatSilentView } from "./pages/JamatSilentView";
import { Home2 } from "./pages/Home2";
import { ProfileView } from "./pages/ProfileView";
import { Navigation } from "./components/Navigation";
import { SyncStatus } from "./components/SyncStatus";
import { LocationPrompt } from "./components/LocationPrompt";
import { AnimatePresence } from "motion/react";
import { useSettings } from "./hooks/useSettings";
import { useDataSync } from "./hooks/useDataSync";
import { useAuth } from "./hooks/useAuth";

export type ViewType =
  | "home"
  | "home2"
  | "calendar"
  | "settings"
  | "prayer"
  | "Quran"
  | "Question & Answer"
  | "Hadees"
  | "Tajweed"
  | "Adhkar"
  | "qibla"
  | "languages"
  | "donate"
  | "share"
  | "daily"
  | "tasbeeh"
  | "profile"
  | "jamat_silent"
  | string;

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const { settings } = useSettings();
  useDataSync();
  const { user, loading } = useAuth();
  const [skipLogin, setSkipLogin] = useLocalStorage(
    "islamic-app-skip-login",
    false,
  );

  useEffect(() => {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", settings.theme);

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);

    return () => clearTimeout(timeout);
  }, [settings.theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Standard views
  const standardViews = [
    "home",
    "home2",
    "calendar",
    "settings",
    "prayer",
    "Quran",
    "Question & Answer",
    "Hadees",
    "Tajweed",
    "Adhkar",
    "qibla",
    "languages",
    "donate",
    "share",
    "daily",
    "tasbeeh",
    "profile",
    "jamat_silent",
  ];
  const isFeatureView = !standardViews.includes(currentView);

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-emerald-500/30 flex justify-center">
      <main className="w-full max-w-md bg-emerald-950 min-h-[100dvh] relative overflow-hidden shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px] pointer-events-none transition-colors duration-300"></div>

        <SyncStatus />

        {!user && !skipLogin ? (
          <ProfileView
            setView={setCurrentView}
            onSkip={() => setSkipLogin(true)}
          />
        ) : (
          <>
            <AnimatePresence mode="wait">
              {currentView === "home" && <Home setView={setCurrentView} />}
              {currentView === "home2" && <Home2 setView={setCurrentView} />}
              {currentView === "calendar" && (
                <CalendarView setView={setCurrentView} />
              )}
              {currentView === "settings" && (
                <SettingsView setView={setCurrentView} />
              )}
              {currentView === "prayer" && (
                <PrayerDetails setView={setCurrentView} />
              )}
              {currentView === "Quran" && (
                <QuranView setView={setCurrentView} />
              )}
              {currentView === "Hadees" && (
                <HadeesView setView={setCurrentView} />
              )}
              {currentView === "Tajweed" && (
                <TajweedView setView={setCurrentView} />
              )}
              {currentView === "Adhkar" && (
                <AdhkarView setView={setCurrentView} />
              )}
              {currentView === "Question & Answer" && (
                <QuizView setView={setCurrentView} />
              )}
              {currentView === "qibla" && (
                <QiblaDirectionView setView={setCurrentView} />
              )}
              {currentView === "languages" && (
                <LanguagesView setView={setCurrentView} />
              )}
              {currentView === "donate" && (
                <DonateView setView={setCurrentView} />
              )}
              {currentView === "share" && (
                <ShareView setView={setCurrentView} />
              )}
              {currentView === "daily" && (
                <DailyView setView={setCurrentView} />
              )}
              {currentView === "tasbeeh" && (
                <TasbeehView setView={setCurrentView} />
              )}
              {currentView === "profile" && (
                <ProfileView
                  setView={setCurrentView}
                  onSkip={() => setCurrentView("home")}
                />
              )}
              {currentView === "jamat_silent" && (
                <JamatSilentView setView={setCurrentView} />
              )}
              {isFeatureView && (
                <FeatureView title={currentView} setView={setCurrentView} />
              )}
            </AnimatePresence>

            <LocationPrompt />
            {!(currentView === "profile" && !user) && (
              <Navigation view={currentView} setView={setCurrentView} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

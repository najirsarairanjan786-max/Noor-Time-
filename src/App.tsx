import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
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
import { AIPracticeView } from "./pages/AIPracticeView";
import { QazaNamazCalculator } from "./pages/QazaNamazCalculator";
import { KhatamQuranView } from "./pages/KhatamQuranView";
import { JamatSilentView } from "./pages/JamatSilentView";
import { Home2 } from "./pages/Home2";
import { ProfileView } from "./pages/ProfileView";
import { NoorAIView } from "./pages/NoorAIView";
import { NotificationsView } from "./pages/NotificationsView";
import { StoreView } from "./pages/StoreView";
import { ContactView } from "./pages/ContactView";
import { JantriView } from "./pages/JantriView";
import { Navigation } from "./components/Navigation";
import { SyncStatus } from "./components/SyncStatus";
import { LocationPrompt } from "./components/LocationPrompt";
import { NotificationPrompt } from "./components/NotificationPrompt";
import { AnimatePresence } from "motion/react";
import { useSettings } from "./hooks/useSettings";
import { useDataSync } from "./hooks/useDataSync";
import { useAuth } from "./hooks/useAuth";
import { useFCM } from "./hooks/useFCM";
import { useAnniversaryAlarms } from "./hooks/useAnniversaryAlarms";
import { useTasbeehAlarms } from "./hooks/useTasbeehAlarms";

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
  | "noor_ai"
  | "notifications"
  | "store"
  | "jantri" | "aipractice" | "qaza_calculator"
  | string;

import { OfflineBanner } from "./components/OfflineBanner";
import { QuranAudioProvider } from "./components/QuranAudio/QuranAudioContext";
import { MiniPlayer } from "./components/QuranAudio/MiniPlayer";
import { AudioSettingsModal } from "./components/QuranAudio/AudioSettingsModal";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("calendar");
  const [previousView, setPreviousView] = useState<ViewType>("home");
  
  const navigateTo = (newView: ViewType) => {
    if (newView !== currentView) {
      setPreviousView(currentView);
      setCurrentView(newView);
    }
  };
  const { settings } = useSettings();
  useDataSync();
  const { user, loading } = useAuth();
  useFCM();
  useAnniversaryAlarms();
  useTasbeehAlarms();
  const [skipLogin, setSkipLogin] = useLocalStorage(
    "islamic-app-skip-login",
    false,
  );

  useEffect(() => {
    const trackInstall = async () => {
      const isInstalled = localStorage.getItem("noor_app_installed_tracked");
      if (!isInstalled) {
        try {
          await addDoc(collection(db, "app_installs"), {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          });
          localStorage.setItem("noor_app_installed_tracked", "true");
        } catch (error) {
          console.warn("Could not track app install:", error);
        }
      }
    };
    trackInstall();
  }, []);

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
    "noor_ai",
    "notifications",
    "store",
    "contact",
    "jantri",
    "aipractice",
    "qaza_calculator",
  ];
  const isFeatureView = !standardViews.includes(currentView);

  return (
    <QuranAudioProvider>
      <div className="min-h-screen bg-slate-900 font-sans selection:bg-emerald-500/30 flex justify-center">
        <main className="w-full max-w-md bg-emerald-950 min-h-[100dvh] relative overflow-hidden shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] pointer-events-none transition-colors duration-300"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-400/5 blur-[120px] pointer-events-none transition-colors duration-300"></div>

        <SyncStatus />
        <OfflineBanner />

        <>
          <AnimatePresence mode="wait">
            {currentView === "home" && <Home setView={navigateTo} />}
            {currentView === "home2" && <Home2 setView={navigateTo} />}
            {currentView === "calendar" && (
              <CalendarView setView={navigateTo} />
            )}
            {currentView === "settings" && (
              <SettingsView setView={navigateTo} />
            )}
            {currentView === "prayer" && (
              <PrayerDetails setView={navigateTo} />
            )}
            {currentView === "Quran" && <QuranView setView={navigateTo} />}
            {currentView === "Hadees" && (
              <HadeesView setView={navigateTo} />
            )}
            {currentView === "Tajweed" && (
              <TajweedView setView={navigateTo} />
            )}
            {currentView === "Adhkar" && (
              <AdhkarView setView={navigateTo} />
            )}
            {currentView === "Question & Answer" && (
              <QuizView setView={navigateTo} />
            )}
            {currentView === "qibla" && (
              <QiblaDirectionView setView={navigateTo} />
            )}
            {currentView === "languages" && (
              <LanguagesView setView={navigateTo} />
            )}
            {currentView === "donate" && (
              <DonateView setView={navigateTo} />
            )}
            {currentView === "share" && <ShareView setView={navigateTo} />}
            {currentView === "daily" && <DailyView setView={navigateTo} />}
            {currentView === "tasbeeh" && (
              <TasbeehView setView={navigateTo} />
            )}
            {currentView === "profile" && (
              <ProfileView setView={navigateTo} />
            )}
            {currentView === "jamat_silent" && (
              <JamatSilentView setView={navigateTo} />
            )}
            {currentView === "noor_ai" && (
              <NoorAIView setView={navigateTo} />
            )}
            {currentView === "notifications" && (
              <NotificationsView setView={navigateTo} />
            )}
            {currentView === "store" && (
              <StoreView setView={navigateTo} />
            )}
            {currentView === "contact" && (
              <ContactView setView={navigateTo} />
            )}
            {currentView === "jantri" && (
              <JantriView setView={navigateTo} />
            )}
            {currentView === "qaza_calculator" && <QazaNamazCalculator setView={navigateTo} />}
            {currentView === "aipractice" && (
              <AIPracticeView setView={navigateTo} previousView={previousView} />
            )}
            {currentView === "khatamquran" && (
              <KhatamQuranView setView={navigateTo} />
            )}

            {isFeatureView && (
              <FeatureView title={currentView} setView={navigateTo} />
            )}
          </AnimatePresence>

          <LocationPrompt />
          <NotificationPrompt />
          <Navigation view={currentView} setView={navigateTo} />
        </>
        <MiniPlayer />
        <AudioSettingsModal />
      </main>
    </div>
    </QuranAudioProvider>
  );
}

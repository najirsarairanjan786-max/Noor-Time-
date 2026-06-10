import { motion, AnimatePresence } from "motion/react";
import { useData } from "../hooks/useData";
import { useSettings } from "../hooks/useSettings";
import { useAlarmSystem } from "../hooks/useAlarmSystem";
import { useHijriDate } from "../hooks/useHijriDate";
import { PrayerTimesList } from "../components/PrayerTimesList";
import { Sidebar } from "../components/Sidebar";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import {
  Menu,
  Moon,
  Sun,
  MoonStar,
  CheckSquare,
  Search,
  Book,
  HelpCircle,
  ShieldAlert,
  BadgeInfo,
  Home as HomeIcon,
  Clock,
  Compass,
  BookOpen,
  BookA,
  Heart,
  CalendarDays,
  Star,
  MessageCircle,
  Radio,
  Share2,
  Smartphone,
  BookText,
} from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { ThemeModal } from "../components/ThemeModal";
import { useTranslation } from "../lib/i18n";

type ViewType = "home" | "calendar" | "settings" | "prayer";

interface HomeProps {
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

export function Home({ setView }: HomeProps) {
  const { settings, setSettings, requestLocation } = useSettings();
  const { timings, loading: dataLoading } = useData(
    settings.location,
    settings.method ?? 1,
    settings.school ?? 1,
  );
  const { hijriDate } = useHijriDate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { t, isRTL } = useTranslation(settings.language);

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
      className="pb-24 w-full min-h-screen relative overflow-hidden"
    >
      {/* 3D Professional Background Image - Animated */}
      <div className="fixed inset-0 z-[-1] bg-[#050B14] overflow-hidden">
        <motion.div 
          className="absolute inset-[-10%] bg-cover bg-center bg-no-repeat opacity-60"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop")',
          }}
        />
        {/* Animated Particles Overlay */}
        <motion.div 
          className="absolute inset-0 opacity-30 mix-blend-screen"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
          }}
        />
        {/* Dark subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B14]/70 via-[#050B14]/40 to-[#050B14]/90 pointer-events-none" />
      </div>

      {/* Top Header Area */}
      <div className="relative pt-4 pb-14 px-4 w-full text-white z-10">

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
                  {settings.location?.name ||
                    "ZIR HOUSE, Md Nazir Hussain Dwarikapur, S..."}
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
              <div className="text-right mb-1.5 text-white">
                <div
                  className="text-[30px] font-bold tracking-tight drop-shadow-md leading-none mb-1"
                  dir="ltr"
                >
                  {format(time, "hh:mm:ss a")}
                </div>
                <div
                  className="text-[13px] font-medium opacity-90 drop-shadow-md text-right"
                  dir="ltr"
                >
                  {format(time, "EEEE, d MMM yyyy")}
                </div>
              </div>

              {hijriDate ? (
                <div className="flex items-start gap-1 text-[13px] font-bold drop-shadow-md text-white mt-0.5">
                  <MoonStar
                    className="w-[16px] h-[16px] mt-0.5 text-white"
                    strokeWidth={2.2}
                  />
                  <div className="flex flex-col" dir="ltr">
                    <span>
                      {hijriDate.day} {hijriDate.month.en} ({hijriDate.month.ar}
                      )
                    </span>
                    <span className="text-[12px] leading-tight">
                      {hijriDate.year}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-1 text-[13px] font-bold drop-shadow-md text-white mt-0.5">
                  <MoonStar
                    className="w-[16px] h-[16px] mt-0.5 text-white"
                    strokeWidth={2.2}
                  />
                  <div className="flex flex-col" dir="ltr">
                    <span>
                      {new Intl.DateTimeFormat("en-US-u-ca-islamic", {
                        day: "numeric",
                        month: "long",
                      }).format(
                        new Date(
                          time.getTime() +
                            (-1 +
                              (time.getHours() >= 19 ? 1 : 0) +
                              Number(settings.hijriOffset || 0)) *
                              24 *
                              60 *
                              60 *
                              1000,
                        ),
                      )}
                    </span>
                    <span className="text-[12px] leading-tight">
                      {new Intl.DateTimeFormat("en-US-u-ca-islamic", {
                        year: "numeric",
                      })
                        .format(
                          new Date(
                            time.getTime() +
                              (-1 +
                                (time.getHours() >= 19 ? 1 : 0) +
                                Number(settings.hijriOffset || 0)) *
                                24 *
                                60 *
                                60 *
                                1000,
                          ),
                        )
                        .replace(" AH", "")}
                    </span>
                  </div>
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
          <h3 className="text-white text-[17px] font-extrabold mb-3 px-1 relative z-10 text-shadow-sm">
            {t("more")} Features
          </h3>

          <div className="grid grid-cols-4 gap-y-6 gap-x-2 pb-8">
            {[
              {
                label: "Quran",
                i18nKey: "alQuran",
                icon: <BookOpen />,
                glowText: "text-blue-400",
                glowBg: "bg-blue-500",
              },
              {
                label: "Hadees",
                i18nKey: "hadees",
                icon: <BookText />,
                glowText: "text-orange-400",
                glowBg: "bg-orange-500",
              },
              {
                label: "Question &\nAnswer",
                i18nKey: "qa",
                icon: <MessageCircle />,
                glowText: "text-purple-400",
                glowBg: "bg-purple-500",
              },
              {
                label: "Radio",
                i18nKey: "madaniRadio",
                icon: <Radio />,
                glowText: "text-pink-400",
                glowBg: "bg-pink-500",
              },
              {
                label: "Tajweed",
                i18nKey: "tajweed",
                icon: <BookA />,
                glowText: "text-emerald-400",
                glowBg: "bg-emerald-500",
              },
              {
                label: "Share",
                i18nKey: "share",
                icon: <CalendarDays />,
                glowText: "text-cyan-400",
                glowBg: "bg-cyan-500",
              },
              {
                label: "Tasbih",
                i18nKey: "tasbih",
                icon: <Star />,
                glowText: "text-rose-400",
                glowBg: "bg-rose-500",
              },
              {
                label: "Daily",
                i18nKey: "daily",
                icon: <Clock />,
                glowText: "text-amber-400",
                glowBg: "bg-amber-500",
              },
              {
                label: "More Apps",
                i18nKey: "moreApps",
                icon: <Smartphone />,
                glowText: "text-indigo-400",
                glowBg: "bg-indigo-500",
              },
            ].map((feature, i) => (
              <button
                key={i}
                onClick={() => {
                  if (feature.label === "Quran") setView("Quran" as any);
                  else if (feature.label === "Daily") setView("daily" as any);
                  else if (feature.label === "Tasbih") setView("tasbeeh" as any);
                  else if (feature.label === "Share") setView("share" as any);
                  else setView("home" as any);
                }}
                className="group flex flex-col items-center gap-2.5 outline-none perspective-[1000px]"
              >
                <div
                  className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-[18px] bg-[#0a0a0c] border border-white/10 flex flex-col items-center justify-center relative transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 group-active:scale-95 z-10"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)'
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const xPct = x / rect.width - 0.5;
                    const yPct = y / rect.height - 0.5;
                    e.currentTarget.style.transform = `rotateX(${-yPct * 30}deg) rotateY(${xPct * 30}deg) scale(1.1) translateY(-8px)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)`;
                  }}
                >
                  <div 
                    className={`absolute inset-0 rounded-[18px] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${feature.glowBg}`} 
                    style={{ transform: 'translateZ(-1px)' }} 
                  />
                  
                  {/* Subtle glass reflection */}
                  <div className="absolute inset-0 rounded-[18px] bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />

                  {React.cloneElement(feature.icon as React.ReactElement, { 
                    className: `w-6 h-6 sm:w-7 sm:h-7 relative z-10 ${feature.glowText} drop-shadow-[0_0_10px_currentColor]`,
                    strokeWidth: 1.5,
                    style: { transform: 'translateZ(20px)' }
                  })}
                </div>
                
                <span className="text-[11px] sm:text-xs font-semibold text-slate-300 text-center leading-tight tracking-tight px-1 whitespace-pre-line group-hover:text-white transition-colors">
                  {feature.i18nKey && t(feature.i18nKey as any) !== feature.i18nKey
                    ? t(feature.i18nKey as any)
                    : feature.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        setView={setView}
      />
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </motion.div>
  );
}

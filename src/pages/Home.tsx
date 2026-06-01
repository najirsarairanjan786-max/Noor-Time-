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
      className="pb-24 w-full min-h-screen bg-slate-50"
    >
      {/* Top Header Background Area */}
      <div className="relative pt-4 pb-14 px-4 w-full text-white">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[#2b3c5a] z-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1594145695029-bdad519e95ce?auto=format&fit=crop&q=80&w=800")',
            }}
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
          <h3 className="text-slate-800 text-[17px] font-extrabold mb-3 px-1 relative z-10 text-shadow-sm">
            {t("more")} Features
          </h3>

          <div className="grid grid-cols-2 gap-3 pb-8">
            {[
              {
                label: "Quran",
                i18nKey: "alQuran",
                icon: (
                  <BookOpen
                    className="w-7 h-7 text-[#786b9e]"
                    strokeWidth={1.5}
                  />
                ),
                bg: "bg-[#eeeef6]",
                text: "text-[#786b9e]",
              },
              {
                label: "Hadees",
                i18nKey: "hadees",
                icon: (
                  <BookText
                    className="w-7 h-7 text-[#e98a4d]"
                    strokeWidth={1.5}
                  />
                ),
                bg: "bg-[#fef1e5]",
                text: "text-[#e98a4d]",
              },
              {
                label: "Question &\nAnswer",
                i18nKey: "qa",
                icon: (
                  <MessageCircle
                    className="w-7 h-7 text-[#926caa]"
                    strokeWidth={1.5}
                  />
                ),
                bg: "bg-[#f5f2f8]",
                text: "text-[#926caa]",
              },
              {
                label: "Radio",
                i18nKey: "madaniRadio",
                icon: (
                  <Radio className="w-7 h-7 text-[#a16bae]" strokeWidth={1.5} />
                ),
                bg: "bg-[#f8eff8]",
                text: "text-[#a16bae]",
              },
              {
                label: "Tajweed",
                i18nKey: "tajweed",
                icon: (
                  <BookA className="w-7 h-7 text-[#7da65e]" strokeWidth={1.5} />
                ),
                bg: "bg-[#edf6e9]",
                text: "text-[#7da65e]",
              },
              {
                label: "Share\nPrayer Time",
                i18nKey: "share",
                icon: (
                  <CalendarDays
                    className="w-7 h-7 text-[#7d9961]"
                    strokeWidth={1.5}
                  />
                ),
                bg: "bg-[#f4f7ed]",
                text: "text-[#7d9961]",
              },
              {
                label: "Tasbih",
                i18nKey: "tasbih",
                icon: (
                  <Star className="w-7 h-7 text-[#a78b94]" strokeWidth={1.5} />
                ),
                bg: "bg-[#f6f0f2]",
                text: "text-[#a78b94]",
              },
              {
                label: "Daily",
                i18nKey: "daily",
                icon: (
                  <Clock className="w-7 h-7 text-[#9a9e6b]" strokeWidth={1.5} />
                ),
                bg: "bg-[#f5f6ed]",
                text: "text-[#9a9e6b]",
              },
              {
                label: "More Apps",
                i18nKey: "moreApps",
                icon: (
                  <Smartphone
                    className="w-7 h-7 text-[#9a9e6b]"
                    strokeWidth={1.5}
                  />
                ),
                bg: "bg-[#f5f6ed]",
                text: "text-[#9a9e6b]",
              },
            ].map((feature, i) => (
              <button
                key={i}
                onClick={() => {
                  if (feature.label === "Quran") setView("Quran" as any);
                  else if (feature.label === "Daily") setView("daily" as any);
                  else setView("home" as any);
                }}
                className="bg-white p-2 rounded-[14px] flex items-center justify-start gap-2.5 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow active:scale-95 text-left h-[60px]"
              >
                <div
                  className={`w-[44px] h-[44px] ${feature.bg} rounded-[12px] flex items-center justify-center shrink-0`}
                >
                  {/* Clone element to override w-7 to w-5 */}
                  {React.cloneElement(feature.icon as React.ReactElement, { className: (feature.icon as React.ReactElement).props.className.replace('w-7 h-7', 'w-5 h-5') })}
                </div>
                <span
                  className={`text-[13px] font-extrabold ${feature.text} leading-[1.1] pr-1 whitespace-pre-line tracking-tight`}
                >
                  {feature.i18nKey &&
                  t(feature.i18nKey as any) !== feature.i18nKey
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

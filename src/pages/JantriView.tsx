
import { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "../hooks/useSettings";
import { useData } from "../hooks/useData";
import { IslamicCalendar } from "../components/jantri/IslamicCalendar";
import { JantriBook } from "../components/jantri/JantriBook";
import { ZakatCalculator } from "../components/jantri/ZakatCalculator";
import { AnniversaryReminders } from "../components/jantri/AnniversaryReminders";
import { RamadanProgressWidget } from "../components/jantri/RamadanProgressWidget";
import { RamadanTracker } from "../components/RamadanTracker";
import { Calendar, Book, Calculator, Moon, Bell } from "@/src/lib/icons";
import { CharityHandIcon, LanternCrescentIcon, BookOpenIcon, HijriCalendarIcon, CalendarBellIcon } from "@/src/lib/icons";
import { Dispatch, SetStateAction } from "react";
import { ViewType } from "../App";



export function JantriView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const { timings, date } = useData(settings.location, settings.method, settings.school);
  const { t, isRTL } = useTranslation(settings.language);
  const [activeTab, setActiveTab] = useState<"calendar" | "book" | "zakat" | "ramadan" | "anniversaries">("calendar");

  const tabs = [
    { id: "calendar", label: "Calendar", icon: HijriCalendarIcon },
    { id: "book", label: "Book", icon: BookOpenIcon },
    { id: "zakat", label: "Zakat", icon: CharityHandIcon },
    { id: "ramadan", label: "Ramadan", icon: LanternCrescentIcon },
    { id: "anniversaries", label: t("anniversaries") || "Anniversaries", icon: Bell },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pt-8 pb-32 min-h-screen"
    >
      <div className="px-6 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Islamic Jantri</h1>
        <p className="text-emerald-100/70 text-sm">Comprehensive digital Jantri and Islamic events</p>
      </div>

      <div className="px-6 mb-6">
        <div className="flex bg-emerald-900/40 rounded-xl p-1 relative z-10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 relative z-20 ${
                  isActive ? "text-emerald-950" : "text-emerald-100/70 hover:text-emerald-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="jantriTabIndicator"
                    className="absolute inset-0 bg-emerald-400 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-6">
        {activeTab === "calendar" && <IslamicCalendar />}
        {activeTab === "book" && <JantriBook />}
        {activeTab === "zakat" && <ZakatCalculator />}
        {activeTab === "anniversaries" && <AnniversaryReminders />}
        {activeTab === "ramadan" && (
           <div className="space-y-6">
             <RamadanProgressWidget timings={timings} hijri={date?.hijri || null} gregorian={date?.gregorian || null} />
             <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Live Timer</h2>
                <RamadanTracker timings={timings} hijri={date?.hijri || null} />
             </div>
           </div>
        )}
      </div>
    </motion.div>
  );
}

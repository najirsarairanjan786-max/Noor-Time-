import { useState, Dispatch, SetStateAction } from "react";
import { ChevronLeft } from "@/src/lib/icons";
import { useLocalStorage } from "usehooks-ts";
import { useSettings } from "../hooks/useSettings";

export function JamatSilentView({
  setView,
}: {
  setView: Dispatch<SetStateAction<any>>;
}) {
  const { settings } = useSettings();
  const schoolName = settings.school === 1 ? " \u2014 Hanafi" : "";

  const [alarms, setAlarms] = useLocalStorage<Record<string, boolean>>("islamic-alarms-v3", {
    Fajr: true,
    Zuhr: true,
    "Asr \u2014 Hanafi": true,
    Asr: true,
    Maghrib: true,
    "Isha \u2014 Hanafi": true,
    Isha: true,
    Jumma: true,
    Tahajjud: false,
  });

  const getPrayerNameKey = (name: string) => {
    if (name === "Asr" || name === "Isha") {
      return name + schoolName;
    }
    return name;
  };

  const toggleSilent = (prayer: string) => {
    const key = getPrayerNameKey(prayer);
    setAlarms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const prayers = [
    { name: "Fajr", before: 5, after: 15 },
    { name: "Zuhr", before: 5, after: 15 },
    { name: "Asr", before: 5, after: 15 },
    { name: "Maghrib", before: 2, after: 15 },
    { name: "Isha", before: 5, after: 15 },
  ];

  return (
    <div className="w-full flex-1 flex flex-col pt-10 min-h-screen bg-[#f3f4f6]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')", backgroundBlendMode: "multiply" }}>
      <div className="flex items-center px-4 py-3 bg-[#df4b4b] text-white shadow-md relative z-10">
        <button
          onClick={() => setView("home")}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-[20px] font-bold tracking-tight ml-2">Silent Mode</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {prayers.map((prayer) => {
          const isActive = !alarms[getPrayerNameKey(prayer.name)];

          return (
            <div key={prayer.name} className="bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.05)] border-l-4 border-l-[#df4b4b] p-4 py-5 flex flex-col gap-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-bold text-black tracking-tight">{prayer.name}</span>
                
                {/* Custom Toggle */}
                <button
                  onClick={() => toggleSilent(prayer.name)}
                  className={`w-[48px] h-[26px] rounded-full border-2 transition-colors relative flex items-center shrink-0 ${
                    isActive ? "border-[#df4b4b] bg-white" : "border-gray-300 bg-white"
                  }`}
                >
                  <div className={`flex w-full px-1 items-center justify-between absolute inset-0 ${isActive ? "opacity-100" : "opacity-40"}`}>
                    <div className="flex flex-col gap-[2px] ml-1.5 opacity-60">
                      <div className="w-3.5 h-[1.5px] bg-black"></div>
                      <div className="w-3.5 h-[1.5px] bg-black"></div>
                      <div className="w-3.5 h-[1.5px] bg-black"></div>
                    </div>
                  </div>
                  <div
                    className={`w-[20px] h-[20px] rounded-full shadow-sm transform transition-transform absolute ${
                      isActive ? "translate-x-[22px] bg-[#df4b4b]" : "translate-x-[2px] bg-gray-400"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[15px] font-semibold text-gray-500">
                  {prayer.before} Minutes after your mobile will be silent
                </span>
                <span className="text-[15px] font-semibold text-gray-500">
                  Your mobile will be silent for {prayer.after} Minutes
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

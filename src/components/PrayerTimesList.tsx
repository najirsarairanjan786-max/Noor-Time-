import { PrayerTimings } from "../lib/api";
import {
  Volume2,
  VolumeX,
  Compass,
  BookOpen,
  MapPin,
  Search,
  Pencil,
  Check,
  Clock,
  Sun,
  Sunrise,
  HelpCircle,
  AlarmClock,
  X,
  CloudSun,
  Cloud,
  CloudFog,
  CloudRain,
  Snowflake,
  CloudLightning,
} from "lucide-react";
import {
  parse,
  format,
  isAfter,
  isBefore,
  addDays,
  addMinutes,
  subMinutes,
  differenceInMinutes,
  parseISO,
} from "date-fns";
import { cn } from "../lib/utils";
import { useSettings } from "../hooks/useSettings";
import { useLocalStorage } from "usehooks-ts";
import { useState, useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { QiblaModal } from "./QiblaModal";
import { useTranslation } from "../lib/i18n";

type ViewType = "home" | "calendar" | "settings" | "prayer" | string;

const getWeatherInfo = (code: number) => {
  if (code === 0)
    return { desc: "Clear", icon: <Sun className="w-5 h-5 text-yellow-500" /> };
  if (code >= 1 && code <= 3)
    return {
      desc: "Cloudy",
      icon: <Cloud className="w-5 h-5 text-slate-400" />,
    };
  if (code >= 45 && code <= 48)
    return {
      desc: "Fog",
      icon: <CloudFog className="w-5 h-5 text-slate-400" />,
    };
  if (code >= 51 && code <= 67)
    return {
      desc: "Rain",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
    };
  if (code >= 71 && code <= 77)
    return {
      desc: "Snow",
      icon: <Snowflake className="w-5 h-5 text-sky-300" />,
    };
  if (code >= 80 && code <= 82)
    return {
      desc: "Shower",
      icon: <CloudRain className="w-5 h-5 text-blue-500" />,
    };
  if (code >= 85 && code <= 86)
    return {
      desc: "Snow",
      icon: <Snowflake className="w-5 h-5 text-sky-300" />,
    };
  if (code >= 95 && code <= 99)
    return {
      desc: "Storm",
      icon: <CloudLightning className="w-5 h-5 text-purple-500" />,
    };
  return { desc: "Clear", icon: <Sun className="w-5 h-5 text-yellow-500" /> };
};

export function PrayerTimesList({
  timings,
  setView,
}: {
  timings: PrayerTimings | null;
  setView?: Dispatch<SetStateAction<ViewType>>;
}) {
  const { settings, setSettings, requestLocation } = useSettings();
  const { t } = useTranslation(settings.language);
  const schoolName = settings.school === 1 ? " \u2014 Hanafi" : "";
  const [alarms, setAlarms] = useLocalStorage<Record<string, boolean>>(
    "islamic-alarms-v3",
    {
      Fajr: true,
      Zuhr: true,
      "Asr \u2014 Hanafi": true,
      Maghrib: true,
      "Isha \u2014 Hanafi": true,
      Asr: true,
      Isha: true,
      Jumma: true,
      Tahajjud: true,
    },
  );
  const [now, setNow] = useState(new Date());
  const [editingPrayer, setEditingPrayer] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"fard" | "other">("fard");
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [tahajjudAlarmTime, setTahajjudAlarmTime] = useLocalStorage(
    "tahajjud-alarm-time",
    { hour: 7, minute: 59, period: "PM" },
  );
  const [tempHour, setTempHour] = useState(7);
  const [tempMinute, setTempMinute] = useState(59);
  const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">("PM");
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [weatherDesc, setWeatherDesc] = useState<string>("");
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isQiblaModalOpen, setIsQiblaModalOpen] = useState(false);
  const [dailyWeather, setDailyWeather] = useState<any>(null);
  const [weatherError, setWeatherError] = useState<boolean>(false);

  useEffect(() => {
    if (!settings.location) return;
    const { lat, lng } = settings.location;
    setWeatherError(false);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("Weather request failed");
        return res.json();
      })
      .then((data) => {
        if (data && data.current_weather) {
          setCurrentTemp(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let desc = "Clear";
          if (code >= 1 && code <= 3) desc = "Cloudy";
          else if (code >= 45 && code <= 48) desc = "Fog";
          else if (code >= 51 && code <= 67) desc = "Rain";
          else if (code >= 71 && code <= 77) desc = "Snow";
          else if (code >= 80 && code <= 82) desc = "Shower";
          else if (code >= 85 && code <= 86) desc = "Snow";
          else if (code >= 95 && code <= 99) desc = "Storm";
          setWeatherDesc(desc);
        }
        if (data && data.daily) {
          setDailyWeather(data.daily);
        }
      })
      .catch((err) => {
        setWeatherError(true);
        // Suppress console error in preview environments
      });
  }, [settings.location]);

  // Sync temp state when opening modal
  useEffect(() => {
    if (isReminderOpen) {
      setTempHour(tahajjudAlarmTime.hour);
      setTempMinute(tahajjudAlarmTime.minute);
      setTempPeriod(tahajjudAlarmTime.period as "AM" | "PM");
    }
  }, [isReminderOpen, tahajjudAlarmTime]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!timings) {
    return (
      <div className="space-y-4 mt-8 w-full max-w-md mx-auto">
        <div className="h-32 bg-emerald-800/30 animate-pulse rounded-2xl"></div>
        <div className="h-64 bg-emerald-800/30 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  const isFriday = now.getDay() === 5; // 0 is Sunday, 5 is Friday

  const prayers = [
    {
      name: "Fajr",
      label: t("fajr"),
      time: settings.customTimings?.["Fajr"] || timings.Fajr,
    },
    isFriday
      ? {
          name: "Jumma",
          label: t("jumma"),
          time: settings.customTimings?.["Jumma"] || timings.Dhuhr,
        }
      : {
          name: "Zuhr",
          label: t("dhuhr"),
          time: settings.customTimings?.["Zuhr"] || timings.Dhuhr,
        },
    {
      name: `Asr${schoolName}`,
      label: t("asr"),
      time: settings.customTimings?.[`Asr${schoolName}`] || timings.Asr,
    },
    {
      name: "Maghrib",
      label: t("maghrib"),
      time: settings.customTimings?.["Maghrib"] || timings.Maghrib,
    },
    {
      name: `Isha${schoolName}`,
      label: t("isha"),
      time: settings.customTimings?.[`Isha${schoolName}`] || timings.Isha,
    },
  ];

  let nextPrayerIndex = prayers.findIndex((p, idx) => {
    const prayerTime = parse(p.time.split(" ")[0], "HH:mm", now);
    return isAfter(prayerTime, now);
  });

  if (nextPrayerIndex === -1) nextPrayerIndex = 0;

  const currentPrayerIndex =
    nextPrayerIndex === 0 ? prayers.length - 1 : nextPrayerIndex - 1;

  const fajrTime = timings
    ? parse(timings.Fajr.split(" ")[0], "HH:mm", now)
    : now;
  const sunriseTime = timings
    ? parse(timings.Sunrise.split(" ")[0], "HH:mm", now)
    : now;
  const sunsetTime = timings
    ? parse(timings.Sunset.split(" ")[0], "HH:mm", now)
    : now;

  const tahajjudTime = timings?.Lastthird
    ? parse(timings.Lastthird.split(" ")[0], "HH:mm", now)
    : subMinutes(fajrTime, 90);
  const ishraqTime = addMinutes(sunriseTime, 20);
  const totalMins = differenceInMinutes(sunsetTime, fajrTime);
  const dahwaEKubraTime = addMinutes(fajrTime, Math.floor(totalMins / 2));
  const avoidDelayTime = subMinutes(sunsetTime, 45);

  const otherTimes = [
    {
      name: "Tahajjud",
      timeObj: tahajjudTime,
      icon: "✨",
      hasHelp: true,
      canAlarm: true,
    },
    {
      name: "Sun Rise",
      timeObj: sunriseTime,
      icon: "🌅",
      hasHelp: true,
      canAlarm: false,
    },
    {
      name: "Ishraq & Chasht",
      timeObj: ishraqTime,
      icon: "☀️",
      hasHelp: false,
      canAlarm: false,
    },
    {
      name: "Dahwa-e-kubra",
      timeObj: dahwaEKubraTime,
      icon: "🌞",
      hasHelp: true,
      canAlarm: false,
    },
    {
      name: "Avoid Delay",
      timeObj: avoidDelayTime,
      icon: "⏳",
      hasHelp: true,
      canAlarm: false,
    },
  ];

  const toggleAlarm = (name: string) => {
    setAlarms((prev) => ({ ...prev, [name]: !prev[name] }));
    if (settings.silentMode) {
      setSettings((prev) => ({ ...prev, silentMode: false }));
    }
  };

  const handleGlobalSilentToggle = () => {
    const newSilentState = !settings.silentMode;
    setSettings((p) => ({ ...p, silentMode: newSilentState }));

    setAlarms((prev) => {
      const updated = { ...prev };
      prayers.forEach((p) => {
        updated[p.name] = !newSilentState;
      });
      return updated;
    });
  };

  const handleEditClick = (name: string, currentTime: string) => {
    setEditingPrayer(name);
    setEditingTime(currentTime.split(" ")[0]);
  };

  const handleSaveEdit = (name: string) => {
    if (editingTime) {
      setSettings((prev) => ({
        ...prev,
        customTimings: {
          ...(prev.customTimings || {}),
          [name]: editingTime,
        },
      }));
    }
    setEditingPrayer(null);
  };

  const nextPrayerName = prayers[nextPrayerIndex].name.replace(
    " \u2014 Hanafi",
    "",
  );
  const nextPrayerTimeObj = parse(
    prayers[nextPrayerIndex].time.split(" ")[0],
    "HH:mm",
    now,
  );
  if (nextPrayerIndex === 0 && now.getHours() > 12) {
    nextPrayerTimeObj.setDate(nextPrayerTimeObj.getDate() + 1);
  }

  const getPrevHour = (h: number) => (h === 1 ? 12 : h - 1);
  const getNextHour = (h: number) => (h === 12 ? 1 : h + 1);
  const getPrevMin = (m: number) => (m === 0 ? 59 : m - 1);
  const getNextMin = (m: number) => (m === 59 ? 0 : m + 1);
  const togglePeriod = (p: "AM" | "PM") => (p === "AM" ? "PM" : "AM");
  const formatMin = (m: number) => m.toString().padStart(2, "0");

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Dashboard Top Widget */}
      <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 pr-1 mb-3 flex items-center justify-between relative mt-[-2.5rem] min-h-[7rem]">
        {/* Next Prayer Circular Progress */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="#f1f5f9"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="#64748b"
              strokeWidth="8"
              fill="none"
              strokeDasharray="314"
              strokeDashoffset="120"
              className="text-slate-400"
            />
          </svg>
          <div className="flex flex-col items-center justify-center text-slate-800 z-10 w-full">
            <span className="text-xs uppercase font-bold tracking-widest text-slate-900">
              {prayers[nextPrayerIndex].label}
            </span>
            <span className="text-xl font-bold mt-0 text-slate-800">
              {format(nextPrayerTimeObj, "hh:mm")}
            </span>
          </div>
        </div>

        {/* Quick Actions separated by lines */}
        <div className="flex items-center gap-1 flex-1 justify-around h-16 ml-2">
          <div className="h-full w-px bg-slate-200"></div>

          <button
            onClick={() => setIsQiblaModalOpen(true)}
            className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">
              {t("qiblaFinder")}
            </span>
          </button>

          <div className="h-full w-px bg-slate-200"></div>

          <button
            onClick={() => setView?.("Quran")}
            className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-800">
              {t("quran")}
            </span>
          </button>

          <div className="h-full w-px bg-slate-200"></div>

          <button
            onClick={() => setIsWeatherModalOpen(true)}
            className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
              {dailyWeather ? (
                getWeatherInfo(dailyWeather.weathercode[0]).icon
              ) : (
                <CloudSun className="w-5 h-5 text-sky-500" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-800 flex flex-col items-center leading-[1.1]">
              <span>
                {currentTemp !== null ? `${Math.round(currentTemp)}°` : "--°"}
              </span>
              {weatherDesc && (
                <span className="text-[9px] font-medium text-slate-500">
                  {weatherDesc}
                </span>
              )}
            </span>
          </button>

          {/* Silent Mode sticks out slightly */}
          <button
            onClick={handleGlobalSilentToggle}
            className="flex flex-col items-center gap-1 relative z-10 -mr-4 ml-2 hover:opacity-80 transition-opacity"
          >
            <div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md border-4 border-emerald-950 transition-colors",
                settings.silentMode ? "bg-red-400" : "bg-slate-400",
              )}
            >
              {settings.silentMode ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-800 absolute -bottom-5 right-1 whitespace-nowrap">
              {settings.silentMode ? "Silent On" : "Silent Off"}
            </span>
          </button>
        </div>
      </div>

      {/* Auto Location & Hajj Banner */}
      <div className="mb-4 space-y-2 mt-4 mx-2">
        <div className="bg-[#e6eff5] w-full h-[60px] rounded-lg relative overflow-hidden flex items-center justify-start shadow-sm border border-slate-100">
          <div className="pl-4 flex items-end gap-1 z-10 relative">
            <div className="flex flex-col items-start leading-[1.1]">
              <span className="text-[#195a8f] font-black text-[18px] tracking-tight">
                HAJJ <span className="font-serif italic font-light">&</span>
              </span>
              <span className="text-[#195a8f] font-black text-[22px] tracking-tighter">
                UMRAH
              </span>
            </div>
            <span className="text-[#195a8f] font-semibold text-[13px] tracking-widest mb-1 ml-1">
              SECTION
            </span>
          </div>

          {/* Background overlay graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#e6eff5] via-[#e6eff5]/50 to-transparent z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=100&w=2000&h=600"
              alt="Kaaba 4K"
              className="w-full h-full object-cover object-center relative z-0"
            />
          </div>
        </div>
      </div>

      {/* Prayer Times List Card */}
      <div className="bg-white rounded-[20px] shadow-md border border-slate-100 overflow-hidden mb-8 relative">
        <div className="flex flex-col gap-1 px-3 py-2 text-slate-700 w-full min-h-[300px]">
          {activeTab === "fard"
            ? prayers.map((prayer, idx) => {
                const timeObj = parse(prayer.time.split(" ")[0], "HH:mm", now);
                const isFajr = prayer.name === "Fajr";
                // Mocking end times for demonstration like the image
                const endTimeObj = addDays(timeObj, 0);
                endTimeObj.setHours(timeObj.getHours() + 1);
                endTimeObj.setMinutes(timeObj.getMinutes() + 24);
                const isCurrent = idx === currentPrayerIndex;

                return (
                  <div
                    key={prayer.name}
                    className={cn(
                      "flex flex-row items-center justify-between p-4 rounded-xl transition-colors",
                      isCurrent
                        ? "bg-[#e8f3ec] shadow-sm border border-[#d2e5da]"
                        : "hover:bg-slate-50 border border-transparent",
                    )}
                  >
                    <div className="flex items-center space-x-3 min-w-[120px]">
                      {isFajr ? (
                        <span className="text-slate-400 text-lg">⏱️</span>
                      ) : idx === 3 ? (
                        <span className="text-slate-400 text-lg">🌒</span>
                      ) : (
                        <span className="text-slate-400 text-lg">🌘</span>
                      )}
                      <div className="flex items-center">
                        <span className="font-semibold text-sm font-sans text-slate-800">
                          {prayer.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#265e28] text-white px-2 py-0.5 rounded-full ml-2 font-bold tracking-wider uppercase">
                            {t("now")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 flex-1 text-right">
                      {editingPrayer === prayer.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={editingTime}
                            onChange={(e) => setEditingTime(e.target.value)}
                            className="p-1 rounded border border-slate-300 text-sm font-medium text-slate-800"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(prayer.name)}
                            className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-full text-center"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="font-semibold text-sm text-slate-800 tracking-tight flex items-center group/edit gap-2">
                          <button
                            onClick={() =>
                              handleEditClick(prayer.name, prayer.time)
                            }
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <span>
                            {format(timeObj, "hh:mm")}{" "}
                            <span className="text-[11px] text-slate-500 font-medium">
                              {format(timeObj, "a")}
                            </span>
                          </span>
                        </div>
                      )}

                      {isFajr && !editingPrayer && (
                        <div className="hidden sm:flex text-slate-400 items-center justify-center px-1">
                          —
                          <span className="font-semibold text-sm text-[#cc0000] ml-2 tracking-tight">
                            {format(endTimeObj, "hh:mm")}{" "}
                            <span className="text-[11px] text-[#cc0000] font-medium">
                              {format(endTimeObj, "a")}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-10 flex justify-end">
                      <button
                        onClick={() => toggleAlarm(prayer.name)}
                        className="text-slate-600"
                      >
                        {alarms[prayer.name] ? (
                          <Volume2 className="w-5 h-5" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            : otherTimes.map((ot) => {
                const { timeObj } = ot;
                return (
                  <div
                    key={ot.name}
                    className="flex flex-row items-center justify-between p-4 group hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 w-1/2">
                      <span className="text-slate-400 text-lg">{ot.icon}</span>
                      <span className="font-semibold text-sm font-sans text-slate-800 flex items-center gap-1">
                        {ot.name}
                        {ot.hasHelp && (
                          <div className="bg-[#f0e68c]/50 text-yellow-600 rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold text-[10px]">
                            ?
                          </div>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {ot.name !== "Tahajjud" && (
                        <div className="font-semibold text-sm text-slate-800 tracking-tight flex items-center">
                          <span>
                            {format(timeObj, "hh:mm:ss")}{" "}
                            <span className="text-[11px] text-slate-500 font-medium">
                              {format(timeObj, "a")}
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="w-14 justify-end flex items-center gap-3">
                        {ot.canAlarm ? (
                          <>
                            {ot.name === "Tahajjud" && (
                              <button
                                onClick={() => setIsReminderOpen(true)}
                                className="text-slate-600 transition-colors bg-[#8B0000] p-1.5 rounded-full"
                              >
                                <AlarmClock
                                  className="w-4 h-4 text-white"
                                  strokeWidth={2.5}
                                />
                              </button>
                            )}
                            <button
                              onClick={() => toggleAlarm(ot.name)}
                              className="text-slate-600"
                            >
                              {alarms[ot.name] ? (
                                <Volume2 className="w-5 h-5 text-slate-400 fill-slate-400" />
                              ) : (
                                <VolumeX className="w-5 h-5 text-slate-400 fill-slate-400" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="w-5 h-5 block"></span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Fard Times Toggle on divider line */}
        <div className="border-t border-slate-100 mt-2 relative py-4">
          <div className="absolute -top-4 right-4 bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
            <button
              onClick={() =>
                setActiveTab(activeTab === "fard" ? "other" : "fard")
              }
              className={cn(
                "px-5 py-1.5 rounded-full text-[13px] font-semibold transition-colors",
                activeTab === "fard"
                  ? "bg-[#7ba689] text-white shadow-sm"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100",
              )}
            >
              {activeTab === "fard" ? "Fard Times" : "Other Times"}
            </button>
          </div>
        </div>
      </div>

      {/* Weather Modal */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative">
            <button
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-sky-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                7-Day Forecast
              </h2>
            </div>

            <div className="space-y-4">
              {dailyWeather ? (
                dailyWeather.time.map((dateStr: string, idx: number) => {
                  const date = parseISO(dateStr);
                  const isToday = idx === 0;
                  const dayName = isToday ? "Today" : format(date, "EEEE");
                  const wInfo = getWeatherInfo(dailyWeather.weathercode[idx]);
                  const maxTemp = Math.round(
                    dailyWeather.temperature_2m_max[idx],
                  );
                  const minTemp = Math.round(
                    dailyWeather.temperature_2m_min[idx],
                  );
                  const precipProb =
                    dailyWeather.precipitation_probability_max?.[idx] || 0;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="w-24 font-medium text-[15px] text-slate-700">
                        {dayName}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 flex justify-center">
                          {wInfo.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-600 w-12">
                          {wInfo.desc}
                        </span>
                        {precipProb > 0 && (
                          <span className="text-xs font-semibold text-blue-500 w-10 text-right">
                            {precipProb}%
                          </span>
                        )}
                        {precipProb === 0 && <span className="w-10"></span>}
                      </div>
                      <div className="flex items-center gap-3 font-semibold text-[15px]">
                        <span className="text-slate-400 w-6 text-right">
                          {minTemp}°
                        </span>
                        <span className="text-slate-800 w-6 text-right">
                          {maxTemp}°
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : weatherError ? (
                <div className="text-center text-red-400 py-4 font-medium text-sm">
                  Failed to load weather data. Please check your network
                  connection.
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  Loading weather data...
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <a
                href={
                  settings.location
                    ? `https://www.google.com/search?q=${encodeURIComponent(`weather in ${settings.location.name}`)}`
                    : "https://www.google.com/search?q=weather"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#1c1c1e] hover:bg-black text-white py-3.5 rounded-2xl font-medium text-[15px] transition-colors flex items-center justify-center gap-2"
              >
                <span>View Live on Google</span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {isReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-[340px] shadow-2xl p-8 pb-6 relative">
            <h2 className="text-[19px] leading-[1.3] font-medium text-slate-700 mb-10 font-sans">
              When should the Tahajjud reminder be sent?
            </h2>

            <div className="flex flex-col items-center justify-center font-sans mb-10">
              <div className="flex items-center gap-1">
                {/* Hours column */}
                <div className="w-16 flex flex-col items-center">
                  <div
                    onClick={() => setTempHour(getPrevHour(tempHour))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {getPrevHour(tempHour)}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">
                    {tempHour}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div
                    onClick={() => setTempHour(getNextHour(tempHour))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {getNextHour(tempHour)}
                  </div>
                </div>

                {/* Separator */}
                <div className="flex flex-col items-center justify-center h-full pb-2">
                  <div className="h-12"></div>
                  <div className="h-10 flex items-center justify-center font-medium text-slate-500 text-lg px-1">
                    :
                  </div>
                  <div className="h-12"></div>
                </div>

                {/* Minutes column */}
                <div className="w-16 flex flex-col items-center">
                  <div
                    onClick={() => setTempMinute(getPrevMin(tempMinute))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {formatMin(getPrevMin(tempMinute))}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">
                    {formatMin(tempMinute)}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div
                    onClick={() => setTempMinute(getNextMin(tempMinute))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {formatMin(getNextMin(tempMinute))}
                  </div>
                </div>

                {/* AM/PM column */}
                <div className="w-16 flex flex-col items-center ml-2">
                  <div
                    onClick={() => setTempPeriod(togglePeriod(tempPeriod))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {togglePeriod(tempPeriod)}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div className="h-14 flex items-center justify-center text-slate-800 text-[19px] font-medium">
                    {tempPeriod}
                  </div>
                  <div className="w-14 border-t-2 border-slate-400/80"></div>
                  <div
                    onClick={() => setTempPeriod(togglePeriod(tempPeriod))}
                    className="h-12 w-full flex items-center justify-center text-slate-400 text-[17px] font-medium cursor-pointer hover:bg-slate-50"
                  >
                    {togglePeriod(tempPeriod)}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setTahajjudAlarmTime({
                  hour: tempHour,
                  minute: tempMinute,
                  period: tempPeriod,
                });
                setIsReminderOpen(false);
              }}
              className="w-full bg-[#1c1c1e] hover:bg-black text-white py-[18px] rounded-3xl font-medium text-[16px] transition-colors"
            >
              Set Time
            </button>
          </div>
        </div>
      )}
      {/* Qibla Modal */}
      <QiblaModal
        isOpen={isQiblaModalOpen}
        onClose={() => setIsQiblaModalOpen(false)}
        setView={setView}
      />
    </div>
  );
}

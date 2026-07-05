import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Share2,
  Copy,
  Heart,
  Bookmark,
  Settings,
  List,
  Layers,
  ArrowRight,
  Search,
} from "@/src/lib/icons";
import { type ViewType } from "../App";
import { SAHIH_BUKHARI_HADEES } from "../data/hadees";

interface HadeesViewProps {
  setView: (view: ViewType) => void;
}

// Grouping the hadiths for the list view
const HADEES_CATEGORIES = [
  {
    id: "iman",
    titleUr: "كتاب الإيمان (ایمان کا بیان)",
    count: 2,
    items: SAHIH_BUKHARI_HADEES.filter((h) => h.category === "Iman"),
  },
  {
    id: "ilm",
    titleUr: "كتاب العلم (علم کا بیان)",
    count: 1,
    items: SAHIH_BUKHARI_HADEES.filter((h) => h.category === "Ilm"),
  },
  {
    id: "quran",
    titleUr: "فضائل القرآن (قرآن کے فضائل)",
    count: 1,
    items: SAHIH_BUKHARI_HADEES.filter((h) => h.category === "Quran"),
  },
  {
    id: "akhlaq",
    titleUr: "كتاب الأدب (ادب و اخلاق)",
    count: 1,
    items: SAHIH_BUKHARI_HADEES.filter((h) => h.category === "Akhlaq"),
  },
];

export function HadeesView({ setView }: HadeesViewProps) {
  const [activeScreen, setActiveScreen] = useState<
    "list" | "detail" | "settings"
  >("list");
  const [selectedHadeesIndex, setSelectedHadeesIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"topics" | "volumes">("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [keepAwake, setKeepAwake] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [contentFont, setContentFont] = useState("Jameel Noori");
  const [appFont, setAppFont] = useState("Jameel Noori");
  const [bgColor, setBgColor] = useState("#fcfafd");
  const [textColor, setTextColor] = useState("#1e293b");

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("favoriteHadees");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const lowerQuery = searchQuery.trim().toLowerCase();
  const matchesSearch = (item: any) => {
    if (!lowerQuery) return true;
    return (
      item.chapterAr?.toLowerCase().includes(lowerQuery) ||
      item.chapterEn?.toLowerCase().includes(lowerQuery) ||
      item.textAr?.toLowerCase().includes(lowerQuery) ||
      item.textEn?.toLowerCase().includes(lowerQuery) ||
      item.textUr?.toLowerCase().includes(lowerQuery) ||
      item.category?.toLowerCase().includes(lowerQuery)
    );
  };

  const filteredFavorites = SAHIH_BUKHARI_HADEES.filter(
    (h) => favorites.includes(h.id) && matchesSearch(h),
  );
  const filteredCategories = HADEES_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter(matchesSearch),
  })).filter((cat) => cat.items.length > 0);

  const currentHadees = SAHIH_BUKHARI_HADEES[selectedHadeesIndex];
  const isFavorite = currentHadees
    ? favorites.includes(currentHadees.id)
    : false;

  const handleCopy = () => {
    if (!currentHadees) return;
    navigator.clipboard.writeText(
      `${currentHadees.textAr}\n\n${currentHadees.textEn}\n\n${currentHadees.book} - Hadith ${currentHadees.number}`,
    );
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const toggleFavorite = () => {
    if (!currentHadees) return;
    setFavorites((prev) => {
      const isFav = prev.includes(currentHadees.id);
      let newFavs = isFav
        ? prev.filter((id) => id !== currentHadees.id)
        : [...prev, currentHadees.id];
      localStorage.setItem("favoriteHadees", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const openHadees = (id: number) => {
    const idx = SAHIH_BUKHARI_HADEES.findIndex((h) => h.id === id);
    if (idx !== -1) {
      setSelectedHadeesIndex(idx);
      setActiveScreen("detail");
    }
  };

  const nextHadees = () => {
    setSelectedHadeesIndex((prev) => (prev + 1) % SAHIH_BUKHARI_HADEES.length);
  };

  const prevHadees = () => {
    setSelectedHadeesIndex(
      (prev) =>
        (prev - 1 + SAHIH_BUKHARI_HADEES.length) % SAHIH_BUKHARI_HADEES.length,
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans">
      <AnimatePresence mode="wait">
        {activeScreen === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-24"
          >
            {/* Top Bar (Navy Blue) */}
            <div className="bg-[#354458] text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("home")}
                  className="p-1 active:scale-95 transition"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold tracking-wide">
                  صحيح البخاري
                </h1>
              </div>
              <button
                onClick={() => setActiveScreen("settings")}
                className="p-1 active:scale-95 transition"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>

            {/* Header Banner */}
            <div className="p-4">
              <div className="bg-[#354458] rounded-xl p-4 relative overflow-hidden border-2 border-white shadow-lg">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                />

                {/* White Center Card */}
                <div className="bg-white rounded-lg p-4 text-center my-2 shadow-inner relative z-10">
                  <h2 className="text-2xl font-bold font-arabic text-[#354458] mb-1">
                    الجامع المسند الصحيح
                  </h2>
                  <h3 className="text-xl font-bold font-arabic text-[#354458]">
                    معروف بـ صحيح البخاري
                  </h3>
                  <div className="bg-[#a3b8bc]/30 py-1 px-4 mt-2 inline-block rounded-full">
                    <p className="text-sm font-arabic font-bold text-[#354458]">
                      مؤلف: الإمام محمد بن إسماعيل البخاري
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div
                  className="flex justify-center gap-2 mt-4 relative z-10 font-arabic text-sm"
                  dir="rtl"
                >
                  <span className="border border-white/40 text-white px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm">
                    كل احادیث: 7563
                  </span>
                  <span className="border border-white/40 text-white px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm">
                    كل ابواب: 97
                  </span>
                  <span className="border border-white/40 text-white px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm">
                    كل جلدیں: 9
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="تلاش کریں / Search..."
                  className="w-full bg-white border border-[#354458] rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#354458]/50 shadow-sm font-arabic outline-none"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4 flex justify-center">
              <div
                className="flex bg-white rounded-full border border-[#354458] overflow-hidden w-full max-w-md shadow-sm"
                dir="rtl"
              >
                <button
                  onClick={() => setActiveTab("topics")}
                  className={`flex-1 py-2 flex justify-center items-center gap-2 font-bold transition-colors ${activeTab === "topics" ? "bg-[#354458] text-white" : "text-[#354458]"}`}
                >
                  <List className="w-5 h-5" />
                  مضامین
                </button>
                <button
                  onClick={() => setActiveTab("volumes")}
                  className={`flex-1 py-2 flex justify-center items-center gap-2 font-bold transition-colors ${activeTab === "volumes" ? "bg-[#354458] text-white" : "text-[#354458]"}`}
                >
                  <Layers className="w-5 h-5" />
                  جلد
                </button>
                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`flex-1 py-2 flex justify-center items-center gap-2 font-bold transition-colors ${activeTab === "favorites" ? "bg-[#354458] text-white" : "text-[#354458]"}`}
                >
                  <Heart className="w-5 h-5" />
                  محفوظ
                </button>
              </div>
            </div>

            {/* Main Category Header */}
            {activeTab !== "favorites" && (
              <div className="px-4 mb-4">
                <div
                  className="bg-[#94a8b3] rounded-lg p-3 flex items-center justify-between shadow-sm"
                  dir="rtl"
                >
                  <h3 className="font-arabic font-bold text-[#1f2937] text-lg">
                    صحيح البخاري مقدمة
                  </h3>
                  <BookOpen className="w-6 h-6 text-[#1f2937]/70" />
                </div>
              </div>
            )}

            {/* List Content */}
            <motion.div
              key={activeTab + searchQuery}
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="px-4 pb-24 space-y-6"
            >
              {activeTab === "favorites" ? (
                favorites.length === 0 ? (
                  <motion.div
                    variants={listItemVariants}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500"
                  >
                    <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-arabic">کوئی حدیث محفوظ نہیں کی گئی</p>
                    <p className="text-sm mt-1">No saved Hadiths yet</p>
                  </motion.div>
                ) : filteredFavorites.length === 0 ? (
                  <motion.div
                    variants={listItemVariants}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500"
                  >
                    <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-arabic">کوئی نتیجہ نہیں ملا</p>
                    <p className="text-sm mt-1">No results found</p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={listItemVariants}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div
                      className="bg-[#354458] text-white px-4 py-3 flex items-center justify-between"
                      dir="rtl"
                    >
                      <span className="font-arabic font-bold text-lg">
                        محفوظ احادیث (Saved)
                      </span>
                      <span className="border border-white/30 px-3 py-1 rounded-md text-sm font-arabic bg-white/10">
                        {filteredFavorites.length}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 flex flex-col">
                      {filteredFavorites.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openHadees(item.id)}
                          className="w-full text-right bg-[#fcfafd] hover:bg-slate-100 transition px-4 py-4 flex items-center justify-between group active:bg-slate-200"
                          dir="rtl"
                        >
                          <div className="flex flex-col gap-2 w-full pr-0 pl-4 items-start text-right">
                            <span className="font-arabic text-lg text-slate-800 font-medium group-hover:text-[#354458]">
                              باب: {item.chapterAr}
                            </span>
                            <span className="font-arabic text-slate-500 text-sm line-clamp-2 leading-relaxed">
                              {item.textAr}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#354458] flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )
              ) : filteredCategories.length === 0 ? (
                <motion.div
                  variants={listItemVariants}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500"
                >
                  <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-arabic">کوئی نتیجہ نہیں ملا</p>
                  <p className="text-sm mt-1">No results found</p>
                </motion.div>
              ) : (
                filteredCategories.map((category) => (
                  <motion.div
                    variants={listItemVariants}
                    key={category.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div
                      className="bg-[#354458] text-white px-4 py-3 flex items-center justify-between"
                      dir="rtl"
                    >
                      <span className="font-arabic font-bold text-lg">
                        {category.titleUr}
                      </span>
                      <span className="border border-white/30 px-3 py-1 rounded-md text-sm font-arabic bg-white/10">
                        ابواب: {category.count}
                      </span>
                    </div>

                    {/* Category Items */}
                    <div className="divide-y divide-slate-100 flex flex-col">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => openHadees(item.id)}
                          className="w-full text-right bg-[#fcfafd] hover:bg-slate-100 transition px-4 py-4 flex items-center justify-between group active:bg-slate-200"
                          dir="rtl"
                        >
                          <div className="flex flex-col gap-2 w-full pr-0 pl-4 items-start text-right">
                            <span className="font-arabic text-lg text-slate-800 font-medium group-hover:text-[#354458]">
                              باب: {item.chapterAr}
                            </span>
                            <span className="font-arabic text-slate-500 text-sm line-clamp-2 leading-relaxed">
                              {item.textAr}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#354458] flex items-center justify-center text-white shadow-sm shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        ) : activeScreen === "settings" ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 w-full min-h-screen bg-white relative text-slate-800"
          >
            {/* Top Bar (Navy Blue) */}
            <div className="bg-[#354458] text-white px-4 py-4 flex items-center shadow-md sticky top-0 z-20">
              <button
                onClick={() => setActiveScreen("list")}
                className="p-1 active:scale-95 transition absolute left-4"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold tracking-wide w-full text-center">
                Settings
              </h1>
            </div>

            <div className="px-6 py-8 space-y-8">
              {/* Keep Awake */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setKeepAwake(!keepAwake)}
                  className={`relative inline-flex items-center h-9 rounded-full w-[88px] transition-colors border-2 ${
                    keepAwake
                      ? "bg-[#354458] border-[#354458]"
                      : "bg-white border-[#354458]"
                  }`}
                >
                  <span
                    className={`absolute text-[13px] font-bold ${
                      keepAwake ? "right-3 text-white" : "left-4 text-[#354458]"
                    }`}
                  >
                    {keepAwake ? "ON" : "OFF"}
                  </span>
                  <span
                    className={`absolute w-6 h-6 rounded-full transition-transform ${
                      keepAwake
                        ? "bg-white translate-x-1"
                        : "bg-[#354458] translate-x-[52px]"
                    }`}
                  />
                </button>
                <span className="text-xl font-medium text-slate-700">
                  Keep Awake
                </span>
              </div>

              <hr className="border-slate-800" />

              {/* Colors */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-800 font-medium leading-tight">
                      Change
                      <br />
                      Background
                    </span>
                    <label className="w-[42px] h-[42px] rounded-full bg-gradient-to-tr from-[#3b82f6] via-[#ec4899] to-[#f59e0b] shadow-sm transform transition active:scale-95 border-2 border-white cursor-pointer relative overflow-hidden flex items-center justify-center">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="absolute opacity-0 w-16 h-16 cursor-pointer"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-800 font-medium leading-tight">
                      Change Text
                      <br />
                      Color
                    </span>
                    <label className="w-[42px] h-[42px] rounded-full bg-gradient-to-tr from-[#3b82f6] via-[#ec4899] to-[#f59e0b] shadow-sm transform transition active:scale-95 border-2 border-white cursor-pointer relative overflow-hidden flex items-center justify-center">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="absolute opacity-0 w-16 h-16 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setBgColor("#fcfafd");
                      setTextColor("#1e293b");
                    }}
                    className="bg-[#354458] text-white px-8 py-3.5 rounded-full font-medium shadow-md active:scale-95 transition text-[15px]"
                  >
                    Set to Default Colors
                  </button>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-slate-700 font-medium text-lg">Preview</h3>
                <div
                  className="border border-slate-100 rounded-xl py-6 px-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-colors"
                  style={{ backgroundColor: bgColor }}
                >
                  <p
                    className="font-arabic font-bold"
                    style={{ fontSize: `${fontSize}px`, color: textColor }}
                    dir="rtl"
                  >
                    مصطفیٰ جان رحمت پہ لاکھوں سلام
                  </p>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-4 pb-2">
                <h3 className="text-slate-700 font-medium text-lg">
                  Font Size
                </h3>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-[3px] bg-slate-300 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #354458 ${((fontSize - 16) / (48 - 16)) * 100}%, #cbd5e1 ${((fontSize - 16) / (48 - 16)) * 100}%)`,
                    }}
                  />
                  <style>{`
                    input[type=range]::-webkit-slider-thumb {
                      appearance: none;
                      width: 28px;
                      height: 28px;
                      border-radius: 50%;
                      background: #354458;
                      cursor: pointer;
                      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    }
                  `}</style>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Fonts */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">
                    Content Font
                  </span>
                  <div className="relative w-48">
                    <select
                      value={contentFont}
                      onChange={(e) => setContentFont(e.target.value)}
                      className="w-full appearance-none bg-[#94a8b3] text-white rounded-lg py-3 px-4 pr-10 focus:outline-none font-medium"
                    >
                      <option value="Jameel Noori">Jameel Noori</option>
                      <option value="Alvi Nastaleeq">Alvi Nastaleeq</option>
                      <option value="Noto Nastaliq Urdu">Noto Nastaliq</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">App Font</span>
                  <div className="relative w-48">
                    <select
                      value={appFont}
                      onChange={(e) => setAppFont(e.target.value)}
                      className="w-full appearance-none bg-[#94a8b3] text-white rounded-lg py-3 px-4 pr-10 focus:outline-none font-medium"
                    >
                      <option value="Jameel Noori">Jameel Noori</option>
                      <option value="Alvi Nastaleeq">Alvi Nastaleeq</option>
                      <option value="Noto Nastaliq Urdu">Noto Nastaliq</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 w-full min-h-screen relative overflow-hidden transition-colors"
            style={{ backgroundColor: bgColor }}
          >
            {/* Detail View - Custom settings applied */}
            <div className="pt-6 px-4 mb-2 flex items-center justify-between sticky top-0 z-20">
              <button
                onClick={() => setActiveScreen("list")}
                className="w-10 h-10 hover:bg-black/5 backdrop-blur-md rounded-full flex items-center justify-center transition border border-black/10 text-current shadow-sm bg-white/50"
                style={{ color: textColor }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                className="flex flex-col items-end"
                style={{ color: textColor }}
              >
                <h1 className="text-xl font-bold tracking-wide font-arabic">
                  صحيح البخاري
                </h1>
                <p className="text-xs font-bold tracking-widest uppercase opacity-80">
                  {currentHadees?.book || "Hadith"}
                </p>
              </div>
            </div>

            <div className="px-4 max-w-lg mx-auto pb-8 pt-4 relative z-10">
              {currentHadees && (
                <>
                  <motion.div
                    key={currentHadees.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/10 backdrop-blur-md border border-black/10 rounded-3xl overflow-hidden shadow-xl relative"
                    style={{ color: textColor, fontFamily: appFont }}
                  >
                    <div className="border-b border-black/5 py-4 px-6 flex items-center justify-between bg-black/5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 opacity-80" />
                        <span className="font-bold text-xs uppercase tracking-wider opacity-80">
                          Chapter{" "}
                          {currentHadees.chapterEn || currentHadees.chapterAr}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-bold border border-current opacity-80">
                        Hadith {currentHadees.number}
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {currentHadees.narrator && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-lg border border-black/5">
                          <span className="text-xs font-medium opacity-60">
                            Narrated by:
                          </span>
                          <span className="text-sm font-semibold opacity-90">
                            {currentHadees.narrator.replace("Narrated ", "")}
                          </span>
                        </div>
                      )}

                      <div className="text-right pb-4 border-b border-black/5">
                        <h3 className="font-arabic text-sm mb-4 opacity-60">
                          {currentHadees.chapterAr}
                        </h3>
                        <p
                          className="font-arabic leading-[1.8] drop-shadow-sm font-medium"
                          style={{
                            fontSize: `${fontSize}px`,
                            fontFamily: contentFont,
                          }}
                        >
                          {currentHadees.textAr}
                        </p>
                      </div>

                      <div className="pb-4 border-b border-black/5">
                        <span className="font-bold text-[10px] uppercase tracking-widest mb-2 block opacity-70">
                          Urdu Translation
                        </span>
                        <p
                          className="font-arabic leading-relaxed text-right opacity-90"
                          dir="rtl"
                          style={{
                            fontSize: `${Math.max(16, fontSize - 4)}px`,
                            fontFamily: contentFont,
                          }}
                        >
                          {currentHadees.textUr}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-widest mb-2 block opacity-70">
                          English Translation
                        </span>
                        <p
                          className="leading-relaxed font-medium opacity-90"
                          style={{
                            fontSize: `${Math.max(14, fontSize - 8)}px`,
                          }}
                        >
                          {currentHadees.textEn}
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/5 px-6 py-4 flex items-center justify-between border-t border-black/5">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={toggleFavorite}
                          className={`flex items-center gap-2 transition opacity-80 hover:opacity-100 ${isFavorite ? "text-red-500" : ""}`}
                        >
                          <Heart
                            className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`}
                          />
                          <span className="text-xs font-semibold">
                            {isFavorite ? "Saved" : "Save"}
                          </span>
                        </button>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-2 transition opacity-80 hover:opacity-100"
                        >
                          <Copy className="w-5 h-5" />
                          <span className="text-xs font-semibold">Copy</span>
                        </button>
                      </div>
                      <button className="flex items-center gap-2 transition opacity-80 hover:opacity-100">
                        <Share2 className="w-5 h-5" />
                        <span className="text-xs font-semibold">Share</span>
                      </button>
                    </div>
                  </motion.div>

                  <div className="flex items-center justify-between mt-8 max-w-[280px] mx-auto">
                    <button
                      onClick={prevHadees}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 shadow-sm border border-black/10 flex items-center justify-center transition-all active:scale-90 text-current"
                      style={{ color: textColor }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div
                      className="flex flex-col items-center"
                      style={{ color: textColor }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">
                        Hadith
                      </span>
                      <div className="font-mono text-sm tracking-wider font-bold">
                        {selectedHadeesIndex + 1} /{" "}
                        {SAHIH_BUKHARI_HADEES.length}
                      </div>
                    </div>
                    <button
                      onClick={nextHadees}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 shadow-sm border border-black/10 flex items-center justify-center transition-all active:scale-90 text-current"
                      style={{ color: textColor }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

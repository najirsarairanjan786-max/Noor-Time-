import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  BookOpen,
  Search,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

type ViewType = "home" | "calendar" | "settings" | "prayer" | "Quran" | string;

interface QuranViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

const PARAS_DATA = [
  { id: 1, name: "الم", rukus: 17 },
  { id: 2, name: "سَيَقُولُ", rukus: 16 },
  { id: 3, name: "تِلْكَ الرُّسُلُ", rukus: 17 },
  { id: 4, name: "لَنْ تَنَالُوا", rukus: 14 },
  { id: 5, name: "وَالْمُحْصَنَاتُ", rukus: 17 },
  { id: 6, name: "لَا يُحِبُّ اللَّهُ", rukus: 14 },
  { id: 7, name: "وَإِذَا سَمِعُوا", rukus: 19 },
  { id: 8, name: "وَلَوْ أَنَّنَا", rukus: 17 },
  { id: 9, name: "قَالَ الْمَلَأُ", rukus: 18 },
  { id: 10, name: "وَاعْلَمُوا", rukus: 16 },
  { id: 11, name: "يَعْتَذِرُونَ", rukus: 14 },
  { id: 12, name: "وَمَا مِنْ دَابَّةٍ", rukus: 17 },
  { id: 13, name: "وَمَا أُبَرِّئُ", rukus: 15 },
  { id: 14, name: "رُبَمَا", rukus: 17 },
  { id: 15, name: "سُبْحَانَ الَّذِي", rukus: 14 },
  { id: 16, name: "قَالَ أَلَمْ", rukus: 14 },
  { id: 17, name: "اقْتَرَبَ لِلنَّاسِ", rukus: 14 },
  { id: 18, name: "قَدْ أَفْلَحَ", rukus: 16 },
  { id: 19, name: "وَقَالَ الَّذِينَ", rukus: 14 },
  { id: 20, name: "أَمَّنْ خَلَقَ", rukus: 14 },
  { id: 21, name: "اتْلُ مَا أُوحِيَ", rukus: 14 },
  { id: 22, name: "وَمَنْ يَقْنُتْ", rukus: 18 },
  { id: 23, name: "وَمَا لِيَ", rukus: 15 },
  { id: 24, name: "فَمَنْ أَظْلَمُ", rukus: 14 },
  { id: 25, name: "إِلَيْهِ يُرَدُّ", rukus: 15 },
  { id: 26, name: "حم", rukus: 14 },
  { id: 27, name: "قَالَ فَمَا خَطْبُكُمْ", rukus: 18 },
  { id: 28, name: "قَدْ سَمِعَ اللَّهُ", rukus: 9 },
  { id: 29, name: "تَبَارَكَ الَّذِي", rukus: 11 },
  { id: 30, name: "عَمَّ يَتَسَاءَلُونَ", rukus: 14 },
];

export function QuranView({ setView }: QuranViewProps) {
  const [activeTab, setActiveTab] = useState<"QURAN" | "SURAH" | "PARAH">(
    "QURAN",
  );
  const [selectedPara, setSelectedPara] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [paraData, setParaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cachedParas, setCachedParas] = useState<number[]>([]);
  const [pages, setPages] = useState<{ pageNumber: number; ayahs: any[] }[]>(
    [],
  );
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [surahs, setSurahs] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setSurahs(data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const cached = [];
    for (let i = 1; i <= 30; i++) {
      if (localStorage.getItem(`quran_juz_${i}`)) {
        cached.push(i);
      }
    }
    setCachedParas(cached);
  }, [selectedPara]);

  const processData = (data: any) => {
    if (data && data.ayahs) {
      const grouped = data.ayahs.reduce((acc: any, ayah: any) => {
        const pageNum = ayah.page || 1; // if surah endpoint doesn't have page, put all in page 1
        if (!acc[pageNum]) acc[pageNum] = [];
        acc[pageNum].push(ayah);
        return acc;
      }, {});
      const sortedPages = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b)
        .map((pageNum) => ({
          pageNumber: pageNum,
          ayahs: grouped[pageNum],
        }));
      setPages(sortedPages);
      setCurrentPageIndex(0);
      setParaData(data);
    }
  };

  useEffect(() => {
    if (selectedPara !== null || selectedSurah !== null) {
      const id = selectedPara !== null ? selectedPara : selectedSurah;
      const type = selectedPara !== null ? "juz" : "surah";
      const cacheKey = `quran_${type}_${id}_with_hindi`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          processData(parsed);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Cache parsing error", e);
        }
      }

      setLoading(true);
      Promise.all([
        fetch(`https://api.alquran.cloud/v1/${type}/${id}/quran-uthmani`).then(
          (res) => res.json(),
        ),
        fetch(`https://api.alquran.cloud/v1/${type}/${id}/hi.hindi`).then(
          (res) => res.json(),
        ),
      ])
        .then(([uthmaniData, hindiData]) => {
          if (uthmaniData?.data && hindiData?.data) {
            // Merge Hindi text into uthmani ayahs
            const ayahsWithTranslation = uthmaniData.data.ayahs.map(
              (ayah: any, index: number) => {
                return {
                  ...ayah,
                  hindiText: hindiData.data.ayahs[index]?.text || "",
                };
              },
            );
            const mergedData = {
              ...uthmaniData.data,
              ayahs: ayahsWithTranslation,
            };
            try {
              localStorage.setItem(cacheKey, JSON.stringify(mergedData));
            } catch (e) {
              console.warn("Could not cache data", e);
            }
            processData(mergedData);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setParaData(null);
      setPages([]);
    }
  }, [selectedPara, selectedSurah]);

  if (selectedPara !== null || selectedSurah !== null) {
    const currentSurahInfo = surahs.find((s) => s.number === selectedSurah);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-[100dvh] bg-white relative overflow-hidden"
      >
        {/* Reader Header */}
        <div className="relative z-20 flex items-center p-4 bg-white border-b border-gray-100">
          <button
            onClick={() => {
              setSelectedPara(null);
              setSelectedSurah(null);
            }}
            className="w-10 h-10 flex items-center justify-center bg-transparent border border-black rounded-lg text-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <div className="flex-1 flex justify-center pr-10">
            <h1 className="text-xl font-bold text-black font-sans">
              Recite Quran
            </h1>
          </div>
        </div>

        {/* Quran Content */}
        <div
          className="relative z-10 flex-1 overflow-y-auto px-0 pb-24 pt-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0dbd1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Red Surah Header Box */}
          {selectedSurah !== null && currentSurahInfo && (
            <div className="bg-[#df4b4b] text-white mx-2 mt-2 p-[2px] rounded-lg relative overflow-hidden shadow-sm">
              <div className="border border-white/50 rounded-md p-4 relative">
                {/* Top corners decoration */}
                <svg
                  className="absolute -top-1 -left-1 w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M 24 0 Q 12 0 0 12 L 0 0 Z" />
                  <circle cx="6" cy="6" r="2" fill="white" />
                </svg>
                <svg
                  className="absolute -top-1 -right-1 w-6 h-6 text-white transform rotate-90"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M 24 0 Q 12 0 0 12 L 0 0 Z" />
                  <circle cx="6" cy="6" r="2" fill="white" />
                </svg>
                {/* Bottom corners decoration */}
                <svg
                  className="absolute -bottom-1 -left-1 w-6 h-6 text-white transform -rotate-90"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M 24 0 Q 12 0 0 12 L 0 0 Z" />
                  <circle cx="6" cy="6" r="2" fill="white" />
                </svg>
                <svg
                  className="absolute -bottom-1 -right-1 w-6 h-6 text-white transform rotate-180"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M 24 0 Q 12 0 0 12 L 0 0 Z" />
                  <circle cx="6" cy="6" r="2" fill="white" />
                </svg>

                <div
                  className="flex flex-col items-center relative z-10 w-full"
                  dir="rtl"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-center w-full mb-3 px-2">
                    <div className="text-center flex items-center gap-1">
                      <span className="text-sm font-arabic font-bold">
                        آياتها
                      </span>
                      <span className="font-bold text-lg">
                        {currentSurahInfo.numberOfAyahs}
                      </span>
                    </div>
                    <div className="text-center font-arabic font-bold text-3xl">
                      {currentSurahInfo.name.replace(/سُورَةُ\s*/g, "")}
                    </div>
                    <div className="text-center flex flex-col items-center leading-tight">
                      <span className="font-bold text-lg">5</span>{" "}
                      {/* Placeholder for revelation order if unavailable */}
                      <span className="text-xs font-arabic">
                        (
                        {currentSurahInfo.revelationType === "Meccan"
                          ? "مكية"
                          : "مدنية"}
                        )
                      </span>
                    </div>
                  </div>

                  {/* Middle row details */}
                  <div className="flex justify-between items-center w-full px-2 mb-2">
                    <span className="font-bold text-lg">
                      {currentSurahInfo.number}
                    </span>
                    <div className="text-center flex items-center gap-1">
                      <span className="text-sm font-arabic font-bold">
                        ركوعاتها
                      </span>
                      <span className="font-bold text-lg">
                        {Math.ceil(currentSurahInfo.numberOfAyahs / 10)}
                      </span>
                    </div>
                  </div>

                  {/* Bismillah */}
                  <div className="text-center font-arabic font-bold text-2xl tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#df4b4b] gap-4">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold">Loading Data...</p>
            </div>
          ) : pages.length > 0 ? (
            <div className="flex flex-col" dir="rtl">
              <div className="p-4 sm:p-6 mb-2 flex flex-col gap-6">
                {pages[currentPageIndex].ayahs.map((ayah: any, idx: number) => (
                  <div
                    key={ayah.number}
                    className="flex flex-col border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="text-right">
                      <span className="inline font-arabic text-2xl md:text-3xl leading-[2.2] md:leading-[2.5] text-black">
                        {ayah.text}
                        <span className="inline-flex items-center justify-center text-black font-sans mx-1">
                          ({ayah.numberInSurah})
                        </span>
                      </span>
                    </div>
                    {ayah.hindiText && (
                      <div
                        dir="ltr"
                        className="text-left mt-3 font-sans text-[15px] text-gray-700 leading-relaxed"
                      >
                        {ayah.hindiText}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End of Surah / Ruku marker */}
              {currentPageIndex === pages.length - 1 && currentSurahInfo && (
                <div className="flex items-center justify-center w-full py-6 text-[#df4b4b] relative px-4">
                  {/* Left Line */}
                  <div className="flex items-center flex-1">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#df4b4b]"
                    >
                      <path
                        d="M 12 2 Q 18 12 12 22 Q 6 12 12 2 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M 0 12 L 24 12"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="h-[2px] bg-[#df4b4b] flex-1"></div>
                    <div className="flex items-center gap-1 mx-2">
                      <div className="w-2 h-2 rounded-full bg-[#df4b4b]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#df4b4b]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#df4b4b]"></div>
                    </div>
                  </div>

                  {/* Center "ع" Symbol */}
                  <div className="flex flex-col items-center justify-center w-12 font-arabic relative -top-3">
                    <span className="text-sm font-bold absolute -top-4 text-black">
                      {currentSurahInfo.number}
                    </span>
                    <span className="text-4xl text-black">ع</span>
                    <span className="text-sm font-bold absolute -bottom-3 text-black">
                      {currentSurahInfo.numberOfAyahs}
                    </span>
                  </div>

                  {/* Right Line */}
                  <div className="flex items-center flex-1">
                    <div className="flex items-center gap-1 mx-2">
                      <div className="w-2 h-2 rounded-full bg-[#df4b4b]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#df4b4b]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#df4b4b]"></div>
                    </div>
                    <div className="h-[2px] bg-[#df4b4b] flex-1"></div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#df4b4b] transform rotate-180"
                    >
                      <path
                        d="M 12 2 Q 18 12 12 22 Q 6 12 12 2 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M 0 12 L 24 12"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPageIndex((p) =>
                      Math.min(pages.length - 1, p + 1),
                    )
                  }
                  disabled={currentPageIndex === pages.length - 1}
                  className="px-6 py-2.5 bg-[#f7f3eb] border border-[#c0a062] text-[#5e4b2d] font-bold rounded-full disabled:opacity-50 hover:bg-[#eadebd] transition-colors shadow-sm"
                >
                  Next Page
                </button>
                <span className="font-bold text-[#5e4b2d]">
                  Page {pages[currentPageIndex].pageNumber} (
                  {currentPageIndex + 1} / {pages.length})
                </span>
                <button
                  onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                  disabled={currentPageIndex === 0}
                  className="px-6 py-2.5 bg-[#f7f3eb] border border-[#c0a062] text-[#5e4b2d] font-bold rounded-full disabled:opacity-50 hover:bg-[#eadebd] transition-colors shadow-sm"
                >
                  Prev Page
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 font-bold text-red-500">
              Failed to load API data.
            </div>
          )}
        </div>

        {/* Bottom Red Navigation Bar for Reader */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#df4b4b] text-white flex justify-around items-center py-2 px-2 z-50 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
          <button className="flex flex-col items-center justify-center p-2 min-w-[64px] active:scale-95 transition-transform">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="m8 11 4 4 4-4" />
            </svg>
            <span className="text-[12px] font-bold mt-1 tracking-tight">
              Hindi
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 min-w-[64px] active:scale-95 transition-transform">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span className="text-[12px] font-bold mt-1 tracking-tight">
              Downloads
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 min-w-[64px] active:scale-95 transition-transform">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="8 17 12 21 16 17" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <polyline points="8 7 12 3 16 7" />
              <line x1="12" y1="12" x2="12" y2="3" />
            </svg>
            <span className="text-[12px] font-bold mt-1 tracking-tight">
              Auto Scroll
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 min-w-[64px] active:scale-95 transition-transform">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-[12px] font-bold mt-1 tracking-tight">
              Settings
            </span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 flex flex-col font-sans min-h-[100dvh] relative"
      style={{
        backgroundColor: "#f6f5f3",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0dbd1' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Background Pattern Overlay (Optional, simulating the geometric background) */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white/70 backdrop-blur-md border-b-[3px] border-b-gray-100/50 shadow-sm sticky top-0 z-20">
          <button
            onClick={() => setView("home")}
            className="w-9 h-9 flex items-center justify-center border-[1.5px] border-gray-300 rounded-[10px] bg-transparent text-black hover:bg-black/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1
            className="text-[20px] font-bold text-black tracking-tight"
            style={{ marginLeft: "-16px" }}
          >
            Recite Quran
          </h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-5">
          {/* Tabs */}
          <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-200/50">
            {["QURAN", "SURAH", "PARAH"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-[10px] rounded-full font-bold text-[14px] transition-colors shadow-sm ${
                  activeTab === tab
                    ? "bg-[#df4b4b] text-white shadow-md"
                    : "text-[#df4b4b] bg-transparent shadow-none"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white border-2 border-[#df4b4b] rounded-full py-3.5 pl-6 pr-14 text-gray-800 placeholder-black font-extrabold text-[15px] focus:outline-none focus:ring-2 focus:ring-[#df4b4b]/20 shadow-sm"
            />
            <Search
              className="w-6 h-6 text-black absolute right-5 top-1/2 -mt-3"
              strokeWidth={2.5}
            />
          </div>

          {activeTab === "QURAN" ? (
            <>
              {/* Hero Banner */}
              <div className="relative w-full rounded-[18px] overflow-hidden shadow-md group">
                {/* Quran Image Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=800&auto=format&fit=crop')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative flex flex-col justify-end p-5 text-white z-10 pb-4">
                  <div className="flex items-end justify-between mb-3 pt-6">
                    <div className="flex flex-col flex-1 pb-1">
                      <h2 className="text-[28px] font-extrabold mb-1 drop-shadow-lg tracking-tight leading-none mt-auto">
                        Khatam -e- Quran
                      </h2>
                    </div>
                  </div>
                  <div className="bg-[#e4e4e4]/95 backdrop-blur-sm text-black py-2.5 px-3 rounded-full text-[13px] font-bold text-center w-full truncate shadow-sm">
                    Create daily plan for the recitation of Quran
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-[14px]">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2">
                    <BookOpen
                      className="w-[84px] h-[84px] text-[#fb6060]"
                      strokeWidth={1}
                      style={{
                        strokeLinejoin: "round",
                        strokeLinecap: "round",
                      }}
                    />
                    {/* Simulate the cross pages inside the book icon */}
                    <div className="absolute w-[36px] h-[3px] bg-[#fb6060] rounded-full rotate-[-25deg] top-[48%] left-[24%]"></div>
                    <div className="absolute w-[36px] h-[3px] bg-[#fb6060] rounded-full rotate-[25deg] top-[48%] right-[24%]"></div>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <div className="w-full h-[1.5px] bg-[#fb6060] mb-2 rounded-full hidden"></div>
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight">
                      Hindi Translation
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2">
                    <BookOpen
                      className="w-[84px] h-[84px] text-[#fb6060]"
                      strokeWidth={1}
                    />
                    <div className="absolute w-[36px] h-[3px] bg-[#fb6060] rounded-full rotate-[-25deg] top-[48%] left-[24%]"></div>
                    <div className="absolute w-[36px] h-[3px] bg-[#fb6060] rounded-full rotate-[25deg] top-[48%] right-[24%]"></div>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight">
                      16 lines Quran
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-0 active:scale-95 transition-transform h-[190px]">
                  <div className="flex-1 flex flex-col items-center justify-center text-[#fb6060] font-arabic font-bold text-[36px] leading-[1] text-center whitespace-pre-wrap -mt-2 drop-shadow-sm">
                    <span className="relative z-10 mb-[-12px]">
                      صراط الجنان
                    </span>
                    <span className="text-[18px] relative z-20">في</span>
                    <span className="relative z-10 mt-[-10px]">
                      تفسير القرآن
                    </span>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1 mt-auto">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[16px] font-arabic relative top-0.5">
                      صراط الجنان
                    </span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[190px]">
                  <div className="flex-1 flex items-center justify-center mb-2 mt-4 relative w-full">
                    <div className="w-[72px] h-[100px] bg-[#fb6060] rounded-[8px] relative flex flex-col items-center justify-center shadow-inner pt-2 pb-2 px-1">
                      {/* Binding effect */}
                      <div className="absolute left-[3px] top-0 bottom-0 w-[4px] bg-black/15 mix-blend-overlay border-r border-[#fb6060]/30 z-20"></div>
                      <div className="absolute right-[2px] top-0 bottom-0 w-[8px] bg-white rounded-r-md z-0 shadow-inner"></div>

                      <div className="w-[56px] h-full border-[3px] border-white/90 rounded-[4px] relative z-10 flex flex-col justify-between items-center py-2 bg-transparent ml-1">
                        <div className="w-3 h-3 bg-white rotate-45 transform mt-[2px] rounded-[1px]"></div>
                        <div
                          className="w-7 h-10 bg-white rotate-0 flex items-center justify-center"
                          style={{
                            clipPath:
                              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          }}
                        >
                          <div
                            className="w-3.5 h-6 bg-[#fb6060]"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                          ></div>
                        </div>
                        <div className="w-3 h-3 bg-white rotate-45 transform mb-[2px] rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Ifham-ul-Quran
                    </span>
                  </div>
                </div>

                {/* Card 5 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[190px]">
                  <div className="flex-1 flex items-center justify-center mb-2 mt-4 relative w-full">
                    <div className="w-[72px] h-[100px] bg-[#fb6060] rounded-[8px] relative flex flex-col items-center justify-center shadow-inner pt-2 pb-2 px-1">
                      {/* Binding effect */}
                      <div className="absolute left-[3px] top-0 bottom-0 w-[4px] bg-black/15 mix-blend-overlay border-r border-[#fb6060]/30 z-20"></div>
                      <div className="absolute right-[2px] top-0 bottom-0 w-[8px] bg-white rounded-r-md z-0 shadow-inner"></div>

                      <div className="w-[56px] h-full border-[3px] border-white/90 rounded-[4px] relative z-10 flex flex-col justify-between items-center py-2 bg-transparent ml-1">
                        <div className="w-3 h-3 bg-white rotate-45 transform mt-[2px] rounded-[1px]"></div>
                        <div
                          className="w-7 h-10 bg-white rotate-0 flex items-center justify-center"
                          style={{
                            clipPath:
                              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          }}
                        >
                          <div
                            className="w-3.5 h-6 bg-[#fb6060]"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                          ></div>
                        </div>
                        <div className="w-3 h-3 bg-white rotate-45 transform mb-[2px] rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] font-arabic tracking-tight whitespace-nowrap">
                      خزائن العرفان
                    </span>
                  </div>
                </div>

                {/* Card 6 */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[190px]">
                  <div className="flex-1 flex items-center justify-center mb-2 mt-4 relative w-full">
                    <div className="w-[72px] h-[100px] bg-[#fb6060] rounded-[8px] relative flex flex-col items-center justify-center shadow-inner pt-2 pb-2 px-1">
                      {/* Binding effect */}
                      <div className="absolute left-[3px] top-0 bottom-0 w-[4px] bg-black/15 mix-blend-overlay border-r border-[#fb6060]/30 z-20"></div>
                      <div className="absolute right-[2px] top-0 bottom-0 w-[8px] bg-white rounded-r-md z-0 shadow-inner"></div>

                      <div className="w-[56px] h-full border-[3px] border-white/90 rounded-[4px] relative z-10 flex flex-col justify-between items-center py-2 bg-transparent ml-1">
                        <div className="w-3 h-3 bg-white rotate-45 transform mt-[2px] rounded-[1px]"></div>
                        <div
                          className="w-7 h-10 bg-white rotate-0 flex items-center justify-center"
                          style={{
                            clipPath:
                              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                          }}
                        >
                          <div
                            className="w-3.5 h-6 bg-[#fb6060]"
                            style={{
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                          ></div>
                        </div>
                        <div className="w-3 h-3 bg-white rotate-45 transform mb-[2px] rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] font-arabic tracking-tight whitespace-nowrap">
                      افہام القرآن (اردو)
                    </span>
                  </div>
                </div>

                {/* Card 7 - Last Reading */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2 text-[#fb6060]">
                    {/* Custom SVG icon for Last Reading */}
                    <svg
                      width="84"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6C4 4.89543 4.89543 4 6 4H16C18.2091 4 20 5.79086 20 8V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
                        fill="#fb6060"
                      />
                      <path
                        d="M4 6C4 4.89543 4.89543 4 6 4V20C4.89543 20 4 19.1046 4 18V6Z"
                        fill="white"
                        fillOpacity="0.4"
                      />
                      <rect
                        x="13"
                        y="8"
                        width="4"
                        height="2"
                        rx="1"
                        fill="white"
                      />
                      <rect
                        x="13"
                        y="14"
                        width="4"
                        height="2"
                        rx="1"
                        fill="white"
                      />
                      <rect x="8" y="4" width="2" height="16" fill="white" />
                    </svg>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Last Reading
                    </span>
                  </div>
                </div>

                {/* Card 8 - Favorite */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2 text-[#fb6060]">
                    <svg
                      width="84"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="#fb6060"
                      />
                    </svg>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Favorite
                    </span>
                  </div>
                </div>

                {/* Card 9 - Notes */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2 text-[#fb6060]">
                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 4H17C18.1046 4 19 4.89543 19 6V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V6C5 4.89543 5.89543 4 7 4Z"
                        fill="#fb6060"
                      />
                      <path
                        d="M9 3H15A1 1 0 0 1 16 4V5H8V4A1 1 0 0 1 9 3Z"
                        fill="#fb6060"
                      />
                      <rect
                        x="8"
                        y="9"
                        width="8"
                        height="2"
                        rx="1"
                        fill="white"
                      />
                      <rect
                        x="8"
                        y="13"
                        width="8"
                        height="2"
                        rx="1"
                        fill="white"
                      />
                      <rect
                        x="8"
                        y="17"
                        width="5"
                        height="2"
                        rx="1"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Notes
                    </span>
                  </div>
                </div>

                {/* Card 10 - Bookmark */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2 text-[#fb6060]">
                    <svg
                      width="72"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V22L12 17L5 22V4Z"
                        fill="#fb6060"
                      />
                    </svg>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Bookmark
                    </span>
                  </div>
                </div>

                {/* Card 11 - Downloads */}
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm border-b-[8px] border-[#fb6060] text-center gap-2 active:scale-95 transition-transform h-[170px]">
                  <div className="flex-1 flex items-center justify-center mb-1 relative mt-2 text-[#fb6060]">
                    <svg
                      width="76"
                      height="84"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3V16M12 16L7 11M12 16L17 11"
                        stroke="#fb6060"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 19H19"
                        stroke="#fb6060"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4 14V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V14"
                        stroke="#fb6060"
                        strokeWidth="4"
                      />
                      <rect
                        x="5"
                        y="18"
                        width="14"
                        height="4"
                        rx="1"
                        fill="#fb6060"
                      />
                      <rect x="10" y="3" width="4" height="10" fill="#fb6060" />
                      <path d="M12 17L5 10H19L12 17Z" fill="#fb6060" />
                    </svg>
                  </div>
                  <div className="w-full flex-col justify-end items-center flex pb-1">
                    <hr className="w-[85%] border-black mb-1.5 border-[0.5px]" />
                    <span className="font-extrabold text-black text-[15px] tracking-tight whitespace-nowrap">
                      Downloads
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "PARAH" ? (
            <div className="grid grid-cols-2 gap-[14px]" dir="rtl">
              {PARAS_DATA.map((parah) => (
                <div
                  key={parah.id}
                  dir="ltr"
                  onClick={() => setSelectedPara(parah.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col justify-between relative overflow-hidden h-[160px] active:scale-95 transition-transform border-b-[4px] cursor-pointer"
                >
                  {/* Top Right Decoration */}
                  <svg
                    className="absolute top-0 right-0 w-12 h-12 text-[#df4b4b] opacity-80 pointer-events-none"
                    viewBox="0 0 50 50"
                    fill="currentColor"
                  >
                    <path
                      d="M 50 0 L 50 20 Q 30 20 20 30 Q 15 40 10 50 L 0 50 Q 8 30 20 20 Q 30 8 50 0 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 45 5 Q 35 15 25 25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="40" cy="10" r="3" />
                    <circle cx="30" cy="8" r="2" />
                    <circle cx="42" cy="18" r="2" />
                  </svg>

                  {/* Bottom Left Decoration */}
                  <svg
                    className="absolute bottom-0 left-0 w-12 h-12 text-[#df4b4b] opacity-80 pointer-events-none transform rotate-180"
                    viewBox="0 0 50 50"
                    fill="currentColor"
                  >
                    <path
                      d="M 50 0 L 50 20 Q 30 20 20 30 Q 15 40 10 50 L 0 50 Q 8 30 20 20 Q 30 8 50 0 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 45 5 Q 35 15 25 25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="40" cy="10" r="3" />
                    <circle cx="30" cy="8" r="2" />
                    <circle cx="42" cy="18" r="2" />
                  </svg>

                  <div className="flex justify-between items-start z-10 relative">
                    <div className="w-7 h-7 bg-[#df4b4b] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                      {parah.id}
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center text-center z-10 relative leading-[1.2]">
                    <span className="font-arabic font-bold text-2xl text-black">
                      {parah.name}
                    </span>
                  </div>

                  <div className="flex justify-end items-center gap-1 z-10 relative mt-auto pt-2">
                    <span className="font-bold text-black text-[16px]">
                      {parah.rukus}
                    </span>
                    <div className="bg-[#df4b4b] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm tracking-tight border-b-2 border-r-2 border-[#b93b3b]">
                      Total Ruku
                    </div>
                    <BookOpen
                      className="w-[18px] h-[18px] text-[#df4b4b]"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === "SURAH" ? (
            <div className="flex flex-col gap-[14px]">
              {surahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => setSelectedSurah(surah.number)}
                  className="bg-white rounded-[12px] shadow-sm border border-gray-100 p-3 pt-3 flex flex-col gap-3 relative active:scale-95 transition-transform cursor-pointer"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    {/* Left: Icon */}
                    <div className="text-[#df4b4b]">
                      {surah.revelationType === "Meccan" ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          <path d="M7 6l5-2.5 5 2.5-5 2.5-5-2.5z" />
                          <path d="M7 6v8l5 2.5v-8" />
                          <path d="M17 6v8l-5 2.5" />
                          <path d="M7 9l5 2.5" />
                          <path d="M17 9l-5 2.5" />
                          <path d="M11 12.5v4" />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        >
                          <path d="M4 20h16" />
                          <path d="M7 20v-4c0-2.5 5-2.5 5 0v4" />
                          <path d="M12 16v-4c0-3 5-3 5 0v4" />
                          <path d="M14 8v12" />
                          <path d="M16 8v12" />
                          <path d="M14 8l1-3 1 3z" />
                          <path d="M9 16c0-2 3-2 3 0" />
                        </svg>
                      )}
                    </div>

                    {/* Right: Surah Name and Number */}
                    <div className="flex items-center gap-3">
                      <span className="font-arabic font-bold text-[26px] text-black leading-none">
                        {surah.name.replace(/سُورَةُ\s*/g, "")}
                      </span>
                      <div className="w-[30px] h-[30px] rounded-full bg-[#df4b4b] text-white flex items-center justify-center font-bold text-[14px]">
                        {surah.number.toString().padStart(2, "0")}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-end">
                    {/* Left: Star */}
                    <div className="text-[#df4b4b]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={surah.number === 1 ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>

                    {/* Right: Ruku and Verses */}
                    <div className="flex items-center gap-4 sm:gap-6 pr-1">
                      {/* Ruku */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-black text-[13px]">
                          {Math.ceil(surah.numberOfAyahs / 10)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                        <span className="bg-[#df4b4b] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-[4px] leading-none tracking-tight">
                          Total Ruku
                        </span>
                        <BookOpen
                          className="w-[18px] h-[18px] text-[#df4b4b]"
                          strokeWidth={2}
                        />
                      </div>

                      {/* Verses */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-black text-[13px]">
                          {surah.numberOfAyahs.toString().padStart(2, "0")}
                        </span>
                        <span className="bg-[#df4b4b] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-[4px] leading-none tracking-tight">
                          Total Verses
                        </span>
                        <BookOpen
                          className="w-[18px] h-[18px] text-[#df4b4b]"
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="w-full text-center py-4">
            <span
              className="font-extrabold text-[13px] text-black tracking-tight"
              style={{ textShadow: "0px 1px 1px white" }}
            >
              Content Version:2026.05.20.376
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, Loader2, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';

type ViewType = 'home' | 'calendar' | 'settings' | 'prayer' | 'Quran' | string;

interface QuranViewProps {
  setView: Dispatch<SetStateAction<ViewType>>;
  key?: string;
}

const PARAS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Juz ${i + 1}`,
}));

export function QuranView({ setView }: QuranViewProps) {
  const [selectedPara, setSelectedPara] = useState<number | null>(null);
  const [paraData, setParaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cachedParas, setCachedParas] = useState<number[]>([]);
  const [pages, setPages] = useState<{pageNumber: number, ayahs: any[]}[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

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
        const pageNum = ayah.page;
        if (!acc[pageNum]) acc[pageNum] = [];
        acc[pageNum].push(ayah);
        return acc;
      }, {});
      const sortedPages = Object.keys(grouped).map(Number).sort((a, b) => a - b).map(pageNum => ({
        pageNumber: pageNum,
        ayahs: grouped[pageNum]
      }));
      setPages(sortedPages);
      setCurrentPageIndex(0);
      setParaData(data);
    }
  };

  useEffect(() => {
    if (selectedPara !== null) {
      const cacheKey = `quran_juz_${selectedPara}`;
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
      fetch(`https://api.alquran.cloud/v1/juz/${selectedPara}/quran-uthmani`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(data.data));
            } catch (e) {
              console.warn("Could not cache Juz data", e);
            }
            processData(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setParaData(null);
      setPages([]);
    }
  }, [selectedPara]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-24 px-4 pt-12 max-w-lg mx-auto min-h-[100dvh] flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => selectedPara ? setSelectedPara(null) : setView('home')} 
          className="w-10 h-10 bg-emerald-800/50 rounded-full flex items-center justify-center text-white hover:bg-emerald-700/50 transition-colors backdrop-blur-md shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {selectedPara ? `Juz ${selectedPara}` : 'Al-Quran'}
        </h1>
      </div>

      <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <AnimatePresence mode="wait">
          {!selectedPara ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-4 space-y-2"
            >
              <div className="mb-4 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-2">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">30 Paras (Juz)</h2>
                <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                  <DownloadCloud className="w-4 h-4 text-slate-400" /> Opens and saves for offline
                </p>
              </div>

              {PARAS.map(para => {
                const isCached = cachedParas.includes(para.id);
                return (
                  <button
                    key={para.id}
                    onClick={() => setSelectedPara(para.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm">
                        {para.id}
                      </div>
                      <span className="font-semibold text-slate-700">{para.name}</span>
                      {isCached && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-6 flex flex-col"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p>Loading Juz {selectedPara}...</p>
                </div>
              ) : pages.length > 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-4 py-2 mb-6">
                    <span className="text-sm font-semibold text-emerald-700">Page {pages[currentPageIndex].pageNumber}</span>
                    <span className="text-xs text-emerald-600">{currentPageIndex + 1} / {pages.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-6 leading-loose" dir="rtl">
                    {pages[currentPageIndex].ayahs.map((ayah: any) => (
                      <div key={ayah.number} className="text-3xl lg:text-4xl leading-[2.5] text-slate-800 font-arabic font-medium font-serif flex items-start justify-start gap-4 pb-6 border-b border-slate-100/50 last:border-0 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                        <span className="shrink-0 mt-2 flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm lg:text-base leading-none font-sans font-bold">{ayah.numberInSurah}</span>
                        <span className="flex-1 text-right break-words">{ayah.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setCurrentPageIndex(p => Math.min(pages.length - 1, p + 1))}
                      disabled={currentPageIndex === pages.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" /> Previous Page
                    </button>
                    <button 
                      onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                      disabled={currentPageIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      Next Page <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <p>Failed to load data. Please try again.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

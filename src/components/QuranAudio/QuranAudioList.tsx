import React, { useState, useMemo, useEffect } from "react";
import { Search, Play, Pause, Download, CheckCircle2, Clock, Trash2 } from "@/src/lib/icons";
import { useQuranAudio } from "./QuranAudioContext";

export const QuranAudioList: React.FC<{ surahs: any[] }> = ({ surahs }) => {
  const { playSurah, playingSurahId, isPlaying, pause } = useQuranAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const [favoriteSurahs, setFavoriteSurahs] = useState<number[]>([]);

  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Load state
  useEffect(() => {
    checkDownloads();
    setRecentSurahs(JSON.parse(localStorage.getItem("quran_recent_audio") || "[]"));
    setFavoriteSurahs(JSON.parse(localStorage.getItem("quran_favorite_audio") || "[]"));
  }, []);
  
  useEffect(() => {
    if (playingSurahId) {
      setRecentSurahs(prev => {
        const next = [playingSurahId, ...prev.filter(id => id !== playingSurahId)].slice(0, 10);
        localStorage.setItem("quran_recent_audio", JSON.stringify(next));
        return next;
      });
    }
  }, [playingSurahId]);

  const toggleFavorite = (surahId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteSurahs(prev => {
      const isFav = prev.includes(surahId);
      const next = isFav ? prev.filter(id => id !== surahId) : [...prev, surahId];
      localStorage.setItem("quran_favorite_audio", JSON.stringify(next));
      return next;
    });
  };


  const checkDownloads = async () => {
    try {
      const cache = await caches.open("quran-audio-cache");
      const keys = await cache.keys();
      const surahIds = new Set<number>();
      
      // We store metadata in a separate localstorage array for simple querying
      const stored = JSON.parse(localStorage.getItem("quran_downloaded_surahs") || "[]");
      setDownloadedSurahs(stored);
    } catch (e) {}
  };

  const downloadSurah = async (surah: any) => {
    if (downloadingSurah !== null) return;
    setDownloadingSurah(surah.number);
    setDownloadProgress(0);

    try {
      const cache = await caches.open("quran-audio-cache");
      const reciterId = localStorage.getItem("quran_reciter") || "ar.alafasy";
      
      // Fetch surah ayahs to know how many
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
      const data = await res.json();
      const ayahs = data.data.ayahs;
      
      let downloaded = 0;
      for (const ayah of ayahs) {
        const url = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
        const req = new Request(url);
        const exists = await cache.match(req);
        if (!exists) {
          await cache.add(req);
        }
        downloaded++;
        setDownloadProgress(Math.floor((downloaded / ayahs.length) * 100));
      }

      const stored = JSON.parse(localStorage.getItem("quran_downloaded_surahs") || "[]");
      if (!stored.includes(surah.number)) {
        stored.push(surah.number);
        localStorage.setItem("quran_downloaded_surahs", JSON.stringify(stored));
      }
      setDownloadedSurahs(stored);
    } catch (e) {
      console.error(e);
      alert("Download failed. Please check your connection.");
    } finally {
      setDownloadingSurah(null);
      setDownloadProgress(0);
    }
  };

  const deleteSurah = async (surah: any) => {
    try {
      const cache = await caches.open("quran-audio-cache");
      const reciterId = localStorage.getItem("quran_reciter") || "ar.alafasy";
      
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
      const data = await res.json();
      const ayahs = data.data.ayahs;

      for (const ayah of ayahs) {
        const url = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
        await cache.delete(new Request(url));
      }

      let stored = JSON.parse(localStorage.getItem("quran_downloaded_surahs") || "[]");
      stored = stored.filter((id: number) => id !== surah.number);
      localStorage.setItem("quran_downloaded_surahs", JSON.stringify(stored));
      setDownloadedSurahs(stored);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery) return surahs;
    return surahs.filter((s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery)
    );
  }, [searchQuery, surahs]);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-gray-50 p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Surah for audio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#df4b4b] focus:ring-1 focus:ring-[#df4b4b]"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Surah List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {recentSurahs.length > 0 && !searchQuery && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-2 ml-1">Recently Played</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentSurahs.map(id => {
                const s = surahs.find(x => x.number === id);
                if (!s) return null;
                const isPlayingThis = playingSurahId === s.number;
                return (
                  <button
                    key={'recent-'+id}
                    onClick={() => isPlayingThis && isPlaying ? pause() : playSurah(s.number)}
                    className={`min-w-[120px] p-3 rounded-2xl border text-left transition-colors flex flex-col gap-2 ${isPlayingThis ? 'bg-red-50 border-[#df4b4b]' : 'bg-white border-gray-200'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPlayingThis ? 'bg-[#df4b4b] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {isPlayingThis && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-900 truncate">{s.englishName}</h5>
                      <p className="text-[10px] text-gray-500">{s.numberOfAyahs} Ayahs</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2 ml-1">{searchQuery ? "Search Results" : "All Surahs"}</h4>
        {filteredSurahs.map((surah) => {
          const isCurrentlyPlaying = playingSurahId === surah.number;
          const isDownloaded = downloadedSurahs.includes(surah.number);
          const isDownloadingThis = downloadingSurah === surah.number;
          const isFavorite = favoriteSurahs.includes(surah.number);


          return (
            <div
              key={surah.number}
              className={`bg-white border rounded-2xl p-4 flex items-center justify-between transition-shadow ${
                isCurrentlyPlaying ? "border-[#df4b4b] shadow-sm bg-red-50/30" : "border-gray-100 shadow-sm"
              }`}
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => isCurrentlyPlaying && isPlaying ? pause() : playSurah(surah.number)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 relative">
                  {isCurrentlyPlaying && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4">
                      <div className="w-1 bg-[#df4b4b] animate-[bounce_1s_infinite] h-4"></div>
                      <div className="w-1 bg-[#df4b4b] animate-[bounce_1s_infinite_0.2s] h-2"></div>
                      <div className="w-1 bg-[#df4b4b] animate-[bounce_1s_infinite_0.4s] h-3"></div>
                    </div>
                  ) : (
                    surah.number
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{surah.englishName}</h3>
                  <p className="text-xs text-gray-500">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isDownloadingThis ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#df4b4b]">
                    <div className="w-4 h-4 border-2 border-[#df4b4b] border-t-transparent rounded-full animate-spin"></div>
                    {downloadProgress}%
                  </div>
                ) : isDownloaded ? (
                  <button onClick={() => deleteSurah(surah)} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Delete Download">
                    <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                ) : (
                  <button onClick={() => downloadSurah(surah)} className="p-2 text-gray-400 hover:text-[#df4b4b] hover:bg-red-50 rounded-full" title="Download for offline">
                    <Download className="w-5 h-5" />
                  </button>
                )}
                <button onClick={(e) => toggleFavorite(surah.number, e)} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-[#df4b4b] bg-red-50' : 'text-gray-400 hover:text-[#df4b4b] hover:bg-red-50'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                
                <button 
                  onClick={() => isCurrentlyPlaying && isPlaying ? pause() : playSurah(surah.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCurrentlyPlaying ? "bg-[#df4b4b] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {isCurrentlyPlaying && isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {filteredSurahs.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No Surahs found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

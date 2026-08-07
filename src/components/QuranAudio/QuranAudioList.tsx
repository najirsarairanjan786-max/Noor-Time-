import React, { useState, useMemo, useEffect } from "react";
import { Search, Play, Pause, Download, CheckCircle2, Clock, Trash2 } from "@/src/lib/icons";
import { useQuranAudio } from "./QuranAudioContext";
import { useDownloadManager } from "../../hooks/useDownloadManager";

export const QuranAudioList: React.FC<{ surahs: any[] }> = ({ surahs }) => {
  const { playSurah, playingSurahId, isPlaying, pause, activeReciter } = useQuranAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const [favoriteSurahs, setFavoriteSurahs] = useState<number[]>([]);
  const { downloads, downloadSurah, deleteDownload } = useDownloadManager();

  // Load state
  useEffect(() => {
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

  const handleDownload = async (surah: any, type: 'arabic'|'translation', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
      const data = await res.json();
      if (type === 'arabic') {
          await downloadSurah(surah.number, activeReciter.id, data.data.ayahs, []);
      } else {
          await downloadSurah(surah.number, activeReciter.id, data.data.ayahs, ['ur', 'en'], true);
      }
    } catch(e) {
      console.error(e);
      alert("Could not fetch surah metadata for download.");
    }
  };

  const handleDelete = async (surah: any, type: 'arabic'|'translation', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`);
      const data = await res.json();
      await deleteDownload(surah.number, activeReciter.id, data.data.ayahs, type === 'translation');
    } catch (e) {
      console.error(e);
    }
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery) return surahs;
    return surahs.filter((s) =>
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      s.number.toString() === searchQuery
    );
  }, [surahs, searchQuery]);

  const recentList = useMemo(() => {
    return recentSurahs.map(id => surahs.find(s => s.number === id)).filter(Boolean);
  }, [recentSurahs, surahs]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 sm:p-6 pb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search surahs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#df4b4b] focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 pb-24 space-y-3">
        {!searchQuery && recentList.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2 ml-1">
              <Clock className="w-4 h-4" /> Recent
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
              {recentList.map((s: any) => {
                const isCurrentlyPlaying = playingSurahId === s.number;
                return (
                  <button
                    key={'recent-'+s.number}
                    onClick={() => isCurrentlyPlaying && isPlaying ? pause() : playSurah(s.number)}
                    className={`flex-shrink-0 w-32 bg-white border rounded-2xl p-4 text-left transition-all ${
                      isCurrentlyPlaying ? 'border-[#df4b4b] shadow-md ring-1 ring-[#df4b4b]' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                      {isCurrentlyPlaying && isPlaying ? (
                        <Pause className="w-5 h-5 text-[#df4b4b] fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-[#df4b4b] fill-current ml-1" />
                      )}
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
          const downloadKeyAr = `surah_${surah.number}_${activeReciter.id}`;
          const dlStateAr = downloads[downloadKeyAr];
          const isDownloadedAr = dlStateAr?.status === 'downloaded';
          const isDownloadingAr = dlStateAr?.status === 'downloading';

          const downloadKeyTr = `surah_${surah.number}_translation`;
          const dlStateTr = downloads[downloadKeyTr];
          const isDownloadedTr = dlStateTr?.status === 'downloaded';
          const isDownloadingTr = dlStateTr?.status === 'downloading';
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
                <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                    {isDownloadingAr ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#df4b4b]">
                        <div className="w-3 h-3 border-2 border-[#df4b4b] border-t-transparent rounded-full animate-spin"></div>
                        {dlStateAr?.progress ? Math.floor(dlStateAr.progress) : 0}% AR
                      </div>
                    ) : isDownloadedAr ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] text-gray-400 font-normal">AR</span>
                        <button onClick={(e) => handleDelete(surah, 'arabic', e)} className="p-1 text-green-600 hover:bg-green-50 rounded-full" title="Delete Arabic">
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => handleDownload(surah, 'arabic', e)} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-[#df4b4b] hover:bg-red-50 rounded-lg flex items-center gap-1" title="Download Arabic">
                        <Download className="w-3 h-3" /> AR
                      </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isDownloadingTr ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#df4b4b]">
                        <div className="w-3 h-3 border-2 border-[#df4b4b] border-t-transparent rounded-full animate-spin"></div>
                        {dlStateTr?.progress ? Math.floor(dlStateTr.progress) : 0}% TR
                      </div>
                    ) : isDownloadedTr ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] text-gray-400 font-normal">TR</span>
                        <button onClick={(e) => handleDelete(surah, 'translation', e)} className="p-1 text-green-600 hover:bg-green-50 rounded-full" title="Delete Translation">
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => handleDownload(surah, 'translation', e)} className="px-2 py-1 text-[10px] font-bold text-gray-400 hover:text-[#df4b4b] hover:bg-red-50 rounded-lg flex items-center gap-1" title="Download Translation">
                        <Download className="w-3 h-3" /> TR
                      </button>
                    )}
                </div>
              </div>
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

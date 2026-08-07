import { QariSelector } from "./QariSelector";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, X, SkipBack, SkipForward, ChevronUp, ChevronDown, Clock, Settings2, Repeat } from "@/src/lib/icons";
import { useQuranAudio, RECITERS } from "./QuranAudioContext";
import { useOffline } from "../../lib/OfflineContext";

export const MiniPlayer: React.FC = () => {
  const {
    isPlaying,
    isFetchingAudio,
    playingSurahId,
    playingAyahIndex,
    activeReciter,
    progress,
    currentTime,
    duration,
    pause,
    resume,
    stop,
    nextAyah,
    prevAyah,
    playbackSpeed,
    setPlaybackSpeed,
    setActiveReciter,
    setSleepTimer,
    sleepTimerRemaining,
    currentAudioContext,
    playbackMode,
    setPlaybackMode,
    setShowAudioSettings,
    translationLanguage,
    setTranslationLanguage,
    isRepeatingAyah,
    toggleRepeatAyah,
    repeatSurah,
    setRepeatSurah,
    autoContinue,
    setAutoContinue
  } = useQuranAudio();

  const [expanded, setExpanded] = useState(false);
  const { isOnline } = useOffline();
  const [showSettings, setShowSettings] = useState(false);

  const isEmpty = playingSurahId === null && currentAudioContext.length === 0;

  if (isEmpty) return null;

  const ayah = playingAyahIndex !== null ? currentAudioContext[playingAyahIndex] : null;
  const title = playingSurahId ? `Surah ${playingSurahId}` : "Quran Audio";
  const subtitle = ayah ? `Ayah ${ayah.numberInSurah || ayah.number} • ${activeReciter.name}` : activeReciter.name;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-16" /> {/* Spacer */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-[100]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div
              className="h-full bg-[#df4b4b] transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="flex items-center px-4 py-3">
            <div 
              className="flex-1 flex flex-col justify-center cursor-pointer overflow-hidden"
              onClick={() => !isEmpty && setExpanded(!expanded)}
            >
              <h4 className="font-bold text-sm text-gray-900 truncate">{title}</h4>
              <p className="text-xs text-gray-500 truncate flex items-center gap-2">
                {subtitle}
                {!isEmpty && (duration > 0) && (
                  <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                    {`${formatTime(currentTime)} / ${formatTime(duration)}`}
                  </span>
                )}
                {!isEmpty && !isOnline && (
                  <span className="font-bold text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">
                    Offline
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 ml-4">
              <button onClick={prevAyah} disabled={isEmpty} className="p-2 text-gray-600 hover:text-black disabled:opacity-50">
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button 
                onClick={isPlaying ? pause : resume}
                disabled={isEmpty || isFetchingAudio}
                className={`w-10 h-10 flex items-center justify-center text-white rounded-full hover:bg-[#c94343] disabled:opacity-50 ${isEmpty ? 'bg-gray-300' : 'bg-[#df4b4b]'}`}
              >
                {!isEmpty && isFetchingAudio ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                )}
              </button>

              <button onClick={nextAyah} disabled={isEmpty} className="p-2 text-gray-600 hover:text-black disabled:opacity-50">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            
            <button onClick={() => !isEmpty && setExpanded(!expanded)} disabled={isEmpty} className="ml-2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          <AnimatePresence>
            {expanded && !isEmpty && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 bg-gray-50"
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Settings2 className="w-4 h-4" />
                      Playback Settings
                    </div>
                    <button onClick={stop} className="text-xs text-red-500 font-bold px-3 py-1 bg-red-50 rounded-full hover:bg-red-100">
                      Close Player
                    </button>
                  </div>

                  {/* Playback Mode */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Translation Language</label>
                    <div className="flex gap-2 mb-4">
                      {[
                        { id: 'hi', label: 'Hindi' },
                        { id: 'ur', label: 'Urdu' },
                        { id: 'en', label: 'English' }
                      ].map(lang => (
                        <button
                          key={lang.id}
                          onClick={() => setTranslationLanguage(lang.id as any)}
                          className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-lg transition-colors ${translationLanguage === lang.id ? 'bg-[#df4b4b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                    
                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Audio Mode</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'arabic', label: 'Arabic Only' },
                        { id: 'translation', label: 'Hindi Only' },
                        { id: 'both', label: 'Arabic + Hindi' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setPlaybackMode(mode.id as any)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${playbackMode === mode.id ? 'bg-[#df4b4b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Speed */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Speed</label>
                      <div className="flex flex-wrap gap-1">
                        {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            onClick={() => setPlaybackSpeed(speed)}
                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${playbackSpeed === speed ? 'bg-[#df4b4b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <label className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center justify-between">
                        Sleep Timer
                        {sleepTimerRemaining !== null && (
                          <span className="text-[#df4b4b] font-mono">{formatTime(sleepTimerRemaining)}</span>
                        )}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {[15, 30, 45, 60].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setSleepTimer(mins)}
                            className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            {mins}m
                          </button>
                        ))}
                        {sleepTimerRemaining !== null && (
                          <button
                            onClick={() => setSleepTimer(null)}
                            className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600"
                          >
                            Off
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reciter */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Playback Controls</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={isRepeatingAyah} onChange={() => toggleRepeatAyah()} className="w-4 h-4 text-[#df4b4b] rounded border-gray-300" />
                            Repeat Ayah
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={repeatSurah} onChange={(e) => setRepeatSurah(e.target.checked)} className="w-4 h-4 text-[#df4b4b] rounded border-gray-300" />
                            Repeat Surah
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={autoContinue} onChange={(e) => setAutoContinue(e.target.checked)} className="w-4 h-4 text-[#df4b4b] rounded border-gray-300" />
                            Auto Continue to Next Surah
                        </label>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 block">Reciter</label>
                    <QariSelector activeReciter={activeReciter} onSelect={setActiveReciter} />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

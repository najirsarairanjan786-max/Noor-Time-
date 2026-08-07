import React from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Settings2, X } from "@/src/lib/icons";
import { useQuranAudio, RECITERS } from "./QuranAudioContext";
import { QariSelector } from "./QariSelector";

export const AudioSettingsModal = () => {
  const {
    showAudioSettings,
    setShowAudioSettings,
    playbackMode,
    setPlaybackMode,
    playbackSpeed,
    setPlaybackSpeed,
    activeReciter,
    setActiveReciter,
    sleepTimerRemaining,
    setSleepTimer,
    isRepeatingAyah,
    toggleRepeatAyah,
    repeatSurah,
    setRepeatSurah,
    autoContinue,
    setAutoContinue
  } = useQuranAudio();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {showAudioSettings && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50" onClick={() => setShowAudioSettings(false)}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl overflow-hidden shadow-xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-[#df4b4b]" />
                Audio Settings
              </h3>
              <button onClick={() => setShowAudioSettings(false)} className="p-2 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Playback Mode */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Audio Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'arabic', label: 'Arabic Only' },
                    { id: 'translation', label: 'Hindi Only' },
                    { id: 'both', label: 'Arabic + Hindi Translation' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setPlaybackMode(mode.id as any)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border-2 transition-all ${playbackMode === mode.id ? 'border-[#df4b4b] bg-[#df4b4b]/10 text-[#df4b4b]' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'}`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Playback Controls</label>
                <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={isRepeatingAyah} onChange={() => toggleRepeatAyah()} className="w-5 h-5 text-[#df4b4b] rounded border-gray-300 bg-white" />
                        Repeat Ayah
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={repeatSurah} onChange={(e) => setRepeatSurah(e.target.checked)} className="w-5 h-5 text-[#df4b4b] rounded border-gray-300 bg-white" />
                        Repeat Surah
                    </label>
                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={autoContinue} onChange={(e) => setAutoContinue(e.target.checked)} className="w-5 h-5 text-[#df4b4b] rounded border-gray-300 bg-white" />
                        Auto Continue to Next Surah
                    </label>
                </div>
              </div>
                  
              {/* Speed */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Playback Speed</label>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${playbackSpeed === speed ? 'border-[#df4b4b] bg-[#df4b4b]/10 text-[#df4b4b]' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Timer */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                  Sleep Timer
                  {sleepTimerRemaining !== null && (
                    <span className="text-[#df4b4b] bg-[#df4b4b]/10 px-2 py-0.5 rounded-full text-xs font-mono">
                      {formatTime(sleepTimerRemaining)}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setSleepTimer(mins)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200`}
                    >
                      {mins}m
                    </button>
                  ))}
                  {sleepTimerRemaining !== null && (
                    <button
                      onClick={() => setSleepTimer(null)}
                      className="flex-1 py-2 rounded-xl border-2 text-sm font-bold bg-red-50 border-red-200 text-red-600"
                    >
                      Off
                    </button>
                  )}
                </div>
              </div>

              {/* Reciter */}
              <div className="space-y-3 pb-6">
                <label className="text-sm font-bold text-gray-700">Reciter</label>
                <QariSelector activeReciter={activeReciter} onSelect={setActiveReciter} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

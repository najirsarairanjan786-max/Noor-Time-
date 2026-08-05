import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

export type Reciter = {
  id: string;
  name: string;
};

export const RECITERS: Reciter[] = [
  { id: "ar.alafasy", name: "Mishary Alafasy" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit" },
  { id: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahmaan Sudais" },
  { id: "ar.minshawi", name: "Minshawi" },
];

interface QuranAudioContextType {
  isPlaying: boolean;
  playingSurahId: number | null;
  playingAyahIndex: number | null; // 0-indexed across the current playing context (either whole surah or parah)
  activeReciter: Reciter;
  playbackSpeed: number;
  progress: number; // 0 to 1
  currentTime: number;
  duration: number;
  playbackMode: "arabic" | "translation" | "both";
  setPlaybackMode: (mode: "arabic" | "translation" | "both") => void;
  playSurah: (surahId: number, startAyahIndex?: number) => void;
  playAyahSequence: (ayahs: any[], startIndex: number, surahId?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setActiveReciter: (reciter: Reciter) => void;
  setSleepTimer: (minutes: number | null) => void;
  sleepTimerRemaining: number | null;
  currentAudioContext: any[]; // The list of ayahs currently in playlist
}

const QuranAudioContext = createContext<QuranAudioContextType | null>(null);

export const useQuranAudio = () => {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error("useQuranAudio must be used within QuranAudioProvider");
  return ctx;
};

export const QuranAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [activeReciter, setActiveReciter] = useState<Reciter>(RECITERS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<"arabic" | "translation" | "both">("arabic");
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  
  const [currentAudioContext, setCurrentAudioContext] = useState<any[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentModePartRef = useRef<"arabic" | "translation">("arabic");
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<any>(null);

  useEffect(() => {
    // Media Session API for background playing
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevAyah());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextAyah());
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    // Load last position and reciter from localStorage
    try {
      const savedReciterId = localStorage.getItem("quran_reciter");
      if (savedReciterId) {
        const r = RECITERS.find(x => x.id === savedReciterId);
        if (r) setActiveReciter(r);
      }
    } catch (e) {}
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  const getAudioUrl = async (ayahNumber: number, reciterId: string) => {
    // Check if downloaded
    try {
      const cache = await caches.open("quran-audio-cache");
      const req = new Request(`https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahNumber}.mp3`);
      const res = await cache.match(req);
      if (res) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {}
    return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahNumber}.mp3`;
  };

  const playIndex = async (index: number, ayahs: any[], reciter: Reciter, modePart: "arabic" | "translation" = "arabic") => {
    if (index >= ayahs.length || index < 0) {
      stop();
      return;
    }
    
    setPlayingAyahIndex(index);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    currentModePartRef.current = modePart;

    const ayah = ayahs[index];
    
    // Update Media Session Metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Ayah ${ayah.numberInSurah || ayah.number} ${modePart === 'translation' ? '(Translation)' : ''}`,
        artist: reciter.name,
        album: playingSurahId ? `Surah ${playingSurahId}` : 'Quran',
        artwork: [
          { src: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=512&h=512&fit=crop', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();

    const playNext = () => {
      if (playbackMode === "both" && modePart === "arabic") {
        playIndex(index, ayahs, reciter, "translation");
      } else {
        const nextMode = playbackMode === "translation" ? "translation" : "arabic";
        playIndex(index + 1, ayahs, reciter, nextMode);
      }
    };

    if (modePart === "translation") {
      const text = ayah.translationText || ayah.hindiText;
      if (!text) {
        playNext();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "hi-IN";
      utterance.rate = playbackSpeed;
      
      utterance.onend = playNext;
      utterance.onerror = playNext;
      
      ttsUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      const url = await getAudioUrl(ayah.number, reciter.id);
      const audio = new Audio(url);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(audio.currentTime / audio.duration);
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
        }
      };

      audio.onended = () => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        playNext();
      };

      audio.onerror = () => {
        console.warn("Audio error, skipping to next");
        playNext();
      };

      audio.play().catch(e => {
        console.warn("Play failed", e);
        setIsPlaying(false);
      });
    }

    if (playingSurahId) {
      localStorage.setItem("quran_last_played_surah", playingSurahId.toString());
      localStorage.setItem("quran_last_played_ayah_index", index.toString());
    }
  };

  const playSurah = async (surahId: number, startAyahIndex = 0) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
      const data = await res.json();
      
      const hindiRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/hi.hindi`);
      const hindiData = await hindiRes.json();

      if (data && data.data && data.data.ayahs) {
        const ayahs = data.data.ayahs.map((ayah: any, idx: number) => ({
          ...ayah,
          translationText: hindiData?.data?.ayahs[idx]?.text || ""
        }));
        setPlayingSurahId(surahId);
        setCurrentAudioContext(ayahs);
        playIndex(startAyahIndex, ayahs, activeReciter, playbackMode === "translation" ? "translation" : "arabic");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const playAyahSequence = (ayahs: any[], startIndex: number, surahId?: number) => {
    setPlayingSurahId(surahId || null);
    setCurrentAudioContext(ayahs);
    playIndex(startIndex, ayahs, activeReciter, playbackMode === "translation" ? "translation" : "arabic");
  };

  const pause = () => {
    if (currentModePartRef.current === "translation") {
      window.speechSynthesis.pause();
    } else {
      if (audioRef.current) audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentModePartRef.current === "translation") {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      if (audioRef.current && currentAudioContext.length > 0 && playingAyahIndex !== null) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else if (currentAudioContext.length > 0 && playingAyahIndex !== null) {
        playIndex(playingAyahIndex, currentAudioContext, activeReciter, currentModePartRef.current);
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingAyahIndex(null);
    setPlayingSurahId(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const nextAyah = () => {
    if (playingAyahIndex !== null && playingAyahIndex + 1 < currentAudioContext.length) {
      playIndex(playingAyahIndex + 1, currentAudioContext, activeReciter, playbackMode === "translation" ? "translation" : "arabic");
    } else {
      stop();
    }
  };

  const prevAyah = () => {
    if (playingAyahIndex !== null && playingAyahIndex > 0) {
      playIndex(playingAyahIndex - 1, currentAudioContext, activeReciter, playbackMode === "translation" ? "translation" : "arabic");
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (minutes === null) {
      setSleepTimerRemaining(null);
      return;
    }
    setSleepTimerRemaining(minutes * 60);
    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current);
          pause();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSetReciter = (r: Reciter) => {
    setActiveReciter(r);
    localStorage.setItem("quran_reciter", r.id);
    if (isPlaying && playingAyahIndex !== null && currentAudioContext.length > 0) {
      playIndex(playingAyahIndex, currentAudioContext, r, currentModePartRef.current);
    }
  };

  return (
    <QuranAudioContext.Provider
      value={{
        isPlaying,
        playingSurahId,
        playingAyahIndex,
        activeReciter,
        playbackSpeed,
        progress,
        currentTime,
        duration,
        playSurah,
        playAyahSequence,
        pause,
        resume,
        stop,
        nextAyah,
        prevAyah,
        setPlaybackSpeed,
        setActiveReciter: handleSetReciter,
        setSleepTimer,
        sleepTimerRemaining,
        currentAudioContext,
        playbackMode,
        setPlaybackMode
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
};

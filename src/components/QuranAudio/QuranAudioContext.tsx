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
  isFetchingAudio: boolean;
  playingSurahId: number | null;
  playingAyahIndex: number | null; // 0-indexed across the current playing context (either whole surah or parah)
  activeReciter: Reciter;
  playbackSpeed: number;
  progress: number; // 0 to 1
  currentTime: number;
  duration: number;
  playbackMode: "arabic" | "translation" | "both";
  setPlaybackMode: (mode: "arabic" | "translation" | "both") => void;
  isRepeatingAyah: boolean;
  toggleRepeatAyah: () => void;
  repeatSurah: boolean;
  setRepeatSurah: (v: boolean) => void;
  autoContinue: boolean;
  setAutoContinue: (v: boolean) => void;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  translationLanguage: "hi" | "ur" | "en";
  setTranslationLanguage: (lang: "hi" | "ur" | "en") => void;
  setShowAudioSettings: (show: boolean) => void;
  showAudioSettings: boolean;
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
  currentAudioContext: any[];
  currentModePart: "arabic" | "translation"; // The list of ayahs currently in playlist
}

const QuranAudioContext = createContext<QuranAudioContextType | null>(null);

export const useQuranAudio = () => {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error("useQuranAudio must be used within QuranAudioProvider");
  return ctx;
};

export const QuranAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentModePart, setCurrentModePart] = useState<"arabic" | "translation">("arabic");
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(() => {
    const saved = localStorage.getItem("quran_last_played_surah");
    return saved ? parseInt(saved) : null;
  });
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(() => {
    const saved = localStorage.getItem("quran_last_played_ayah_index");
    return saved ? parseInt(saved) : null;
  });
  const [activeReciter, setActiveReciter] = useState<Reciter>(RECITERS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<"arabic" | "translation" | "both">("arabic");
  const [translationLanguage, setTranslationLanguage] = useState<"hi" | "ur" | "en">("hi");
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isRepeatingAyah, setIsRepeatingAyah] = useState(false);
  const [repeatSurah, setRepeatSurah] = useState(false);
  const [autoContinue, setAutoContinue] = useState(true);
  const [repeatCount, setRepeatCount] = useState(0); // 0 = infinite if isRepeatingAyah is true
  const timesRepeatedRef = useRef(0);
  const repeatSurahRef = useRef(repeatSurah);
  const autoContinueRef = useRef(autoContinue);
  const playingSurahIdRef = useRef(playingSurahId);
  useEffect(() => { repeatSurahRef.current = repeatSurah; }, [repeatSurah]);
  useEffect(() => { autoContinueRef.current = autoContinue; }, [autoContinue]);
  useEffect(() => { playingSurahIdRef.current = playingSurahId; }, [playingSurahId]);
  
  const [currentAudioContext, setCurrentAudioContext] = useState<any[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentModePartRef = useRef<"arabic" | "translation">("arabic");
  const isRepeatingAyahRef = useRef(false);
  useEffect(() => {
    isRepeatingAyahRef.current = isRepeatingAyah;
  }, [isRepeatingAyah]);
  
  const toggleRepeatAyah = () => setIsRepeatingAyah(prev => !prev);
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
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  const getAudioUrl = async (ayahNumber: number, reciterId: string, isTranslation = false, lang = "hi") => {
    let transReciter = 'ur.khan';
    if (lang === 'en') transReciter = 'en.walk';
    
    // For Hindi, we fallback to ur.khan if we must use audio, 
    // The playIndex handles TTS fallback.
    
    const baseUrl = isTranslation 
      ? `https://cdn.islamic.network/quran/audio/64/${transReciter}/${ayahNumber}.mp3`
      : `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayahNumber}.mp3`;
      
    // Check if downloaded
    try {
      const cache = await caches.open("quran-audio-cache");
      const req = new Request(baseUrl);
      const res = await cache.match(req);
      if (res) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {}
    return baseUrl;
  };

  const playIndex = async (index: number, ayahs: any[], reciter: Reciter, modePart: "arabic" | "translation" = "arabic", fromRepeat = false) => {
    if (!fromRepeat) {
      timesRepeatedRef.current = 0;
    }
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
    setCurrentModePart(modePart);

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

    const playNext = () => {
      let isLogicalAyahEnd = true;
      if (playbackMode === "both" && modePart === "arabic") {
          isLogicalAyahEnd = false;
      }
      
      if (isLogicalAyahEnd && isRepeatingAyahRef.current) {
         if (repeatCount === 0 || timesRepeatedRef.current < repeatCount - 1) {
             timesRepeatedRef.current += 1;
             const nextMode = playbackMode === "translation" ? "translation" : "arabic";
             playIndex(index, ayahs, reciter, nextMode, true);
             return;
         }
      }
      
      if (!isLogicalAyahEnd) {
        playIndex(index, ayahs, reciter, "translation", true);
      } else {
        if (index + 1 < ayahs.length) {
            const nextMode = playbackMode === "translation" ? "translation" : "arabic";
            playIndex(index + 1, ayahs, reciter, nextMode);
        } else {
            if (repeatSurahRef.current) {
                const nextMode = playbackMode === "translation" ? "translation" : "arabic";
                playIndex(0, ayahs, reciter, nextMode);
            } else if (autoContinueRef.current && playingSurahIdRef.current && playingSurahIdRef.current < 114) {
                playSurah(playingSurahIdRef.current + 1);
            } else {
                stop();
            }
        }
      }
    };

    const isTranslation = modePart === "translation";
    const url = await getAudioUrl(ayah.number, reciter.id, isTranslation, translationLanguage);

    const tryPlayAudio = () => {
        let audio = audioRef.current;
        if (!audio) {
            audio = new Audio();
            audioRef.current = audio;
        }
        audio.src = url;
        audio.playbackRate = playbackSpeed;

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
    };
    
    tryPlayAudio();

    if ('mediaSession' in navigator) {
        let title = "Ayah " + ayah.numberInSurah;
        let artist = reciter.name;
        if (modePart === "translation") {
            artist = translationLanguage === 'en' ? 'Ibrahim Walk (EN)' : 'Shamshad Ali Khan (UR/HI)';
            title = "Translation: " + title;
        }
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: "Quran",
            artwork: [
                { src: 'https://cdn.islamic.network/quran/images/1_1.png', sizes: '96x96', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', resume);
        navigator.mediaSession.setActionHandler('pause', pause);
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (index > 0) {
                playIndex(index - 1, ayahs, reciter, playbackMode === "translation" ? "translation" : "arabic");
            }
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (index + 1 < ayahs.length) {
                playIndex(index + 1, ayahs, reciter, playbackMode === "translation" ? "translation" : "arabic");
            } else {
                if (repeatSurahRef.current) {
                    playIndex(0, ayahs, reciter, playbackMode === "translation" ? "translation" : "arabic");
                } else if (autoContinueRef.current && playingSurahIdRef.current && playingSurahIdRef.current < 114) {
                    playSurah(playingSurahIdRef.current + 1);
                } else {
                    stop();
                }
            }
        });
    }

    if (playingSurahId) {
      localStorage.setItem("quran_last_played_surah", playingSurahId.toString());
      localStorage.setItem("quran_last_played_ayah_index", index.toString());
    }
  };

  const playSurah = async (surahId: number, startAyahIndex = 0) => {
    try {
      setIsFetchingAudio(true);
      const [res, hindiRes, urduRes, engRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}/hi.hindi`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ur.jalandhry`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahId}/en.sahih`)
      ]);
      const data = await res.json();
      const hindiData = await hindiRes.json();
      const urduData = await urduRes.json();
      const engData = await engRes.json();

      if (data && data.data && data.data.ayahs) {
        const ayahs = data.data.ayahs.map((ayah: any, idx: number) => ({
          ...ayah,
          hindiText: hindiData?.data?.ayahs[idx]?.text || "",
          urduText: urduData?.data?.ayahs[idx]?.text || "",
          englishText: engData?.data?.ayahs[idx]?.text || "",
          translationText: hindiData?.data?.ayahs[idx]?.text || "" // fallback
        }));
        setPlayingSurahId(surahId);
        setCurrentAudioContext(ayahs);
        playIndex(startAyahIndex, ayahs, activeReciter, playbackMode === "translation" ? "translation" : "arabic");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingAudio(false);
    }
  };

  const playAyahSequence = (ayahs: any[], startIndex: number, surahId?: number, modeOverride?: "arabic" | "translation") => {
    setPlayingSurahId(surahId || null);
    setCurrentAudioContext(ayahs);
    if (modeOverride && modeOverride !== playbackMode) { setPlaybackMode(modeOverride); } playIndex(startIndex, ayahs, activeReciter, modeOverride || (playbackMode === "translation" ? "translation" : "arabic"));
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    if (audioRef.current && currentAudioContext.length > 0 && playingAyahIndex !== null) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(true);
      });
    } else if (currentAudioContext.length > 0 && playingAyahIndex !== null) {
      playIndex(playingAyahIndex, currentAudioContext, activeReciter, currentModePartRef.current);
    } else if (playingSurahId !== null) {
      playSurah(playingSurahId, playingAyahIndex || 0);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }
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
    isFetchingAudio,
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
    currentModePart,
        playbackMode,
        setPlaybackMode,
        isRepeatingAyah,
        toggleRepeatAyah,
        repeatCount,
        setRepeatCount,
        translationLanguage,
        setTranslationLanguage,
        showAudioSettings,
        setShowAudioSettings
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
};

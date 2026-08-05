export const getDownloadedSurahs = (): number[] => {
  return JSON.parse(localStorage.getItem("quran_downloaded_surahs") || "[]");
};

export const setDownloadedSurahs = (surahs: number[]) => {
  localStorage.setItem("quran_downloaded_surahs", JSON.stringify(surahs));
};

export const deleteSurahAudio = async (surahNumber: number, reciterId: string) => {
  try {
    const cache = await caches.open("quran-audio-cache");
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = await res.json();
    const ayahs = data.data.ayahs;

    for (const ayah of ayahs) {
      const url = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
      await cache.delete(new Request(url));
    }
    
    let stored = getDownloadedSurahs();
    stored = stored.filter(id => id !== surahNumber);
    setDownloadedSurahs(stored);
    return stored;
  } catch (e) {
    console.error(e);
    return getDownloadedSurahs();
  }
};

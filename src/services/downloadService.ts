export const downloadSurah = async (
  surahNumber: number,
  reciterId: string,
  onProgress: (progress: number) => void
) => {
  try {
    const cache = await caches.open("quran-audio-cache");
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
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
      onProgress(Math.floor((downloaded / ayahs.length) * 100));
    }
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

import { useState, useEffect } from 'react';

export type DownloadStatus = 'idle' | 'downloading' | 'downloaded' | 'error';

interface DownloadState {
  status: DownloadStatus;
  progress: number;
  sizeBytes: number;
}

export function useDownloadManager() {
  const [downloads, setDownloads] = useState<Record<string, DownloadState>>({});

  useEffect(() => {
    checkExistingDownloads();
  }, []);

  const checkExistingDownloads = async () => {
    try {
      const saved = localStorage.getItem("quran_downloads_meta_v2");
      if (saved) {
        setDownloads(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveMeta = (newDownloads: Record<string, DownloadState>) => {
    setDownloads(newDownloads);
    localStorage.setItem("quran_downloads_meta_v2", JSON.stringify(newDownloads));
  };

  const downloadSurah = async (surahId: number, reciterId: string, ayahs: any[]) => {
    const key = `surah_${surahId}_${reciterId}`;
    
    // Check if already downloaded
    if (downloads[key]?.status === 'downloaded') return;

    let currentMeta = { ...downloads, [key]: { status: 'downloading' as DownloadStatus, progress: 0, sizeBytes: 0 } };
    saveMeta(currentMeta);

    try {
      const cache = await caches.open("quran-audio-cache");
      let totalBytes = 0;
      let downloadedCount = 0;
      const totalCount = ayahs.length * 2; // Arabic + Translation

      for (const ayah of ayahs) {
        // Arabic
        const arUrl = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;
        try {
            const arRes = await fetch(arUrl);
            if (arRes.ok) {
                const blob = await arRes.blob();
                totalBytes += blob.size;
                await cache.put(arUrl, new Response(blob));
            }
        } catch(e) {}
        downloadedCount++;
        
        currentMeta = {
          ...currentMeta,
          [key]: { status: 'downloading', progress: (downloadedCount / totalCount) * 100, sizeBytes: totalBytes }
        };
        saveMeta(currentMeta);

        // Translation
        const trUrl = `https://cdn.islamic.network/quran/audio/64/ur.khan/${ayah.number}.mp3`;
        try {
            const trRes = await fetch(trUrl);
            if (trRes.ok) {
                const blob = await trRes.blob();
                totalBytes += blob.size;
                await cache.put(trUrl, new Response(blob));
            }
        } catch(e) {}
        downloadedCount++;

        currentMeta = {
            ...currentMeta,
            [key]: { status: 'downloading', progress: (downloadedCount / totalCount) * 100, sizeBytes: totalBytes }
        };
        saveMeta(currentMeta);
      }

      currentMeta = {
        ...currentMeta,
        [key]: { status: 'downloaded', progress: 100, sizeBytes: totalBytes }
      };
      saveMeta(currentMeta);
    } catch (e) {
      currentMeta = {
        ...currentMeta,
        [key]: { status: 'error', progress: 0, sizeBytes: 0 }
      };
      saveMeta(currentMeta);
    }
  };

  const deleteDownload = async (surahId: number, reciterId: string, ayahs: any[]) => {
    const key = `surah_${surahId}_${reciterId}`;
    try {
      const cache = await caches.open("quran-audio-cache");
      for (const ayah of ayahs) {
        await cache.delete(`https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`);
        await cache.delete(`https://cdn.islamic.network/quran/audio/64/ur.khan/${ayah.number}.mp3`);
      }
      const newDownloads = { ...downloads };
      delete newDownloads[key];
      saveMeta(newDownloads);
    } catch (e) {}
  };

  return { downloads, downloadSurah, deleteDownload };
}

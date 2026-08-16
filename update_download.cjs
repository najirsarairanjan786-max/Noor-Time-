const fs = require('fs');
let code = fs.readFileSync('src/pages/QuranView.tsx', 'utf8');

const target = `  const toggleDownload = async (
    type: "SURAH" | "PARAH",
    id: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    
    const isDownloaded = downloads.some((d) => d.type === type && d.id === id);
    
    if (!isDownloaded) {
      alert(\`Downloading \${type} \${id} for offline listening... This will happen in the background.\`);
      
      // Fetch surah ayahs
      if (type === "SURAH") {
        fetch(\`https://api.alquran.cloud/v1/surah/\${id}\`)
          .then(res => res.json())
          .then(async (data) => {
            if (data && data.data && data.data.ayahs) {
              const cache = await caches.open("quran-audio-cache");
              for (const ayah of data.data.ayahs) {
                try {
                  const req = new Request(\`https://cdn.islamic.network/quran/audio/128/ar.alafasy/\${ayah.number}.mp3\`); // Using default reciter for offline or loop through all
                  const res = await fetch(req);
                  if (res.ok) {
                    await cache.put(req, res);
                  }
                } catch(e) {}
              }
              alert(\`Download of \${type} \${id} complete!\`);
            }
          });
      }
    }
    
    setDownloads((prev) => {
      const newDownloads = isDownloaded
        ? prev.filter((d) => !(d.type === type && d.id === id))
        : [...prev, { type, id }];
      localStorage.setItem("quran_downloads", JSON.stringify(newDownloads));
      return newDownloads;
    });
  };`;

const replacement = `  const toggleDownload = async (
    type: "SURAH" | "PARAH",
    id: number,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    
    const isDownloaded = downloads.some((d) => d.type === type && d.id === id);
    
    if (!isDownloaded) {
      alert(\`Downloading \${type} \${id} for offline listening. This will download your selected reciter (\${activeReciter?.name || 'Default'}) and translations in the background.\`);
      
      const endpoint = type === "SURAH" 
        ? \`https://api.alquran.cloud/v1/surah/\${id}\` 
        : \`https://api.alquran.cloud/v1/juz/\${id}/quran-uthmani\`;

      fetch(endpoint)
        .then(res => res.json())
        .then(async (data) => {
          if (data && data.data && data.data.ayahs) {
            const cache = await caches.open("quran-audio-cache");
            const reciterId = activeReciter?.id || "ar.alafasy";
            
            // Sequential download to avoid rate-limiting/crashing
            for (const ayah of data.data.ayahs) {
              try {
                // Arabic audio
                const arUrl = \`https://cdn.islamic.network/quran/audio/128/\${reciterId}/\${ayah.number}.mp3\`;
                const arRes = await fetch(arUrl);
                if (arRes.ok) {
                  const blob = await arRes.blob();
                  await cache.put(arUrl, new Response(blob));
                }

                // English Translation
                const enUrl = \`https://cdn.islamic.network/quran/audio/64/en.walk/\${ayah.number}.mp3\`;
                const enRes = await fetch(enUrl);
                if (enRes.ok) {
                  const blob = await enRes.blob();
                  await cache.put(enUrl, new Response(blob));
                }

                // Urdu Translation
                const urUrl = \`https://cdn.islamic.network/quran/audio/64/ur.khan/\${ayah.number}.mp3\`;
                const urRes = await fetch(urUrl);
                if (urRes.ok) {
                  const blob = await urRes.blob();
                  await cache.put(urUrl, new Response(blob));
                }
              } catch(e) {
                console.warn("Failed to cache ayah audio:", e);
              }
            }
            alert(\`Download of \${type} \${id} complete!\`);
          }
        });
    }
    
    setDownloads((prev) => {
      const newDownloads = isDownloaded
        ? prev.filter((d) => !(d.type === type && d.id === id))
        : [...prev, { type, id }];
      localStorage.setItem("quran_downloads", JSON.stringify(newDownloads));
      return newDownloads;
    });
  };`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/QuranView.tsx', code.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found!");
}

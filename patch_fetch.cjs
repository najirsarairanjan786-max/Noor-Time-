const fs = require('fs');
const file = 'src/lib/OfflineContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const newDownload = `
  const downloadOfflineData = async () => {
    if (!navigator.onLine) {
      alert("Please connect to the internet to download offline data.");
      return;
    }
    setIsDownloading(true);
    setDownloadProgress(10);
    
    try {
      setDownloadProgress(30);
      
      // Attempt to silently fetch current location's prayer times
      const settingsStr = localStorage.getItem("islamic-settings-v2");
      let lat = 21.4225;
      let lng = 39.8262;
      let method = 1;
      let school = 1;
      
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          if (settings.location) {
             lat = settings.location.lat;
             lng = settings.location.lng;
          }
          if (settings.method) method = settings.method;
          if (settings.school) school = settings.school;
        } catch(e) {}
      }
      
      setDownloadProgress(60);
      
      // Import and fetch
      const { fetchPayerTimes, fetchHijriDate } = await import('./api');
      await fetchPayerTimes(lat, lng, method, school);
      await fetchHijriDate(new Date());
      
      setDownloadProgress(100);
      
      // Mark sync date
      const now = new Date().toISOString();
      setLastSyncDate(now);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        calculateCacheSize();
        setOfflineMode(true);
      }, 500);
      
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };
`;

content = content.replace(/const downloadOfflineData = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?setIsDownloading\(false\);\s*\}\s*\};/, newDownload);
fs.writeFileSync(file, content);

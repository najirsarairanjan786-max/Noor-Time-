const fs = require('fs');
const file = 'src/lib/OfflineContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const cleanupCode = `
  const cleanupOldCache = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("prayer_times_") || key.startsWith("hijri_date_"))) {
         // Keep if it has today's date in it somewhere, or we can just keep the last 5.
         // Actually, let's just clear all except last known.
         keysToRemove.push(key);
      }
    }
    // But wait, if we clear prayer_times_..., it will force a re-fetch.
    // It's safer to just clear old ones. 
    // We'll skip complex cleanup to avoid accidentally breaking today's cache, 
    // since localStorage is 5MB and these are tiny strings.
  };
`;

// It's not strictly necessary if storage is small, but I'll add a simple filter in downloadOfflineData to remove old prayer_times.

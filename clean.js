import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const additionalCleanup = `
// Clear large app caches that might be hogging localStorage and causing QuotaExceededError
try {
  const largeCachePrefixes = [
    'jantri_book_data_',
    'quran_juz_',
    'jantri_calendar_',
    'adhan_timings_',
    'hijri_date_',
    'islamic_calendar_',
  ];
  
  const appKeysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Clear firestore local cache to free up space
      if (key.startsWith('firestore_')) {
        appKeysToRemove.push(key);
      }
      // Clear our own large caches
      for (const prefix of largeCachePrefixes) {
        if (key.startsWith(prefix)) {
          appKeysToRemove.push(key);
          break;
        }
      }
    }
  }
  appKeysToRemove.forEach(key => localStorage.removeItem(key));
} catch (e) {
  console.warn("Failed to clear caches from local storage", e);
}
`;

content = content.replace(/try \{\n  const keysToRemove.*?\n\} catch \(e\) \{\n  console.warn\("Failed to clean up firestore local storage", e\);\n\}/s, additionalCleanup);
fs.writeFileSync('src/lib/firebase.ts', content);

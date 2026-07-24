const fs = require('fs');
const file = 'src/lib/api.ts';
let content = fs.readFileSync(file, 'utf8');

const prayerPatch = `
  const isForcedOffline = typeof window !== 'undefined' && (localStorage.getItem("offline_mode_enabled") === "true" || !navigator.onLine);
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached && isForcedOffline) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("Failed to parse cached prayer times", e);
      }
    } else if (cached) {
        try {
            return JSON.parse(cached);
        } catch(e) {}
    }
  }

  if (isForcedOffline) {
     const lastKnown = typeof window !== 'undefined' ? localStorage.getItem(lastKnownKey) : null;
     if (lastKnown) {
        try { return JSON.parse(lastKnown); } catch(e) {}
     }
  }
`;

content = content.replace(
  /if \(typeof window !== 'undefined'\) {\s+const cached = localStorage\.getItem\(cacheKey\);\s+if \(cached\) {\s+try {\s+return JSON\.parse\(cached\);\s+} catch \(e\) {\s+console\.warn\("Failed to parse cached prayer times", e\);\s+}\s+}\s+}/,
  prayerPatch
);

const hijriPatch = `
  const isForcedOffline = typeof window !== 'undefined' && (localStorage.getItem("offline_mode_enabled") === "true" || !navigator.onLine);
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached && isForcedOffline) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn("Failed to parse cached hijri date", e);
      }
    } else if (cached) {
        try {
            return JSON.parse(cached);
        } catch(e) {}
    }
  }

  if (isForcedOffline) {
     const lastKnown = typeof window !== 'undefined' ? localStorage.getItem(lastKnownKey) : null;
     if (lastKnown) {
        try { return JSON.parse(lastKnown); } catch(e) {}
     }
  }
`;

content = content.replace(
  /if \(typeof window !== 'undefined'\) {\s+const cached = localStorage\.getItem\(cacheKey\);\s+if \(cached\) {\s+try {\s+return JSON\.parse\(cached\);\s+} catch \(e\) {\s+console\.warn\("Failed to parse cached hijri date", e\);\s+}\s+}\s+}/,
  hijriPatch
);

fs.writeFileSync(file, content);

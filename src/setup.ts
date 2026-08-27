// This file MUST be imported first to clear out any old bloated caches 
// before other modules (like Firebase Firestore) initialize and crash due to QuotaExceededError.

try {
  let keysRemoved = 0;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && (
      k.startsWith('quran_juz_') || 
      k.startsWith('quran_surah_') || 
      k.startsWith('quran_page_') ||
      k.startsWith('calendar_') || 
      k.startsWith('jantri_cal_') || 
      k.startsWith('prayer_times_') ||
      k.startsWith('hijri_date_') ||
      k.startsWith('jantri_book_data_')
    )) {
      localStorage.removeItem(k);
      keysRemoved++;
    }
  }
  if (keysRemoved > 0) {
    console.log(`Cleared ${keysRemoved} heavy cached items from localStorage on startup to prevent quota issues.`);
  }
} catch (e) {
  console.warn("Failed to clear localStorage on startup", e);
}

// Global interceptor for localStorage to prevent any library (including Firebase) from crashing the app due to QuotaExceededError
try {
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    try {
      originalSetItem.apply(this, [key, value]);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || (e.message && e.message.toLowerCase().includes('quota'))) {
        console.warn(`Storage quota exceeded when setting ${key}. Attempting emergency cleanup...`);
        try {
          // First pass: remove non-essential data
          for (let i = this.length - 1; i >= 0; i--) {
            const k = this.key(i);
            if (k && 
                !k.startsWith('islamic-app-settings') && 
                !k.startsWith('quran_bookmarks') && 
                !k.startsWith('quran_notes') && 
                !k.startsWith('favoriteHadees') &&
                !k.startsWith('firestore_') &&
                !k.startsWith('firebase:')
            ) {
              this.removeItem(k);
            }
          }
          
          try {
             originalSetItem.apply(this, [key, value]);
             return; // Success after first pass!
          } catch (innerE1) {
             console.warn("First pass cleanup failed to free enough space. Executing SECOND pass (Clearing stuck Firebase mutations)...");
             // Second pass: remove firestore mutations. This is necessary because an infinite sync loop
             // previously caused thousands of stuck mutations which consumed all 5MB of quota.
             for (let i = this.length - 1; i >= 0; i--) {
                const k = this.key(i);
                if (k && k.startsWith('firestore_')) {
                   this.removeItem(k);
                }
             }
             originalSetItem.apply(this, [key, value]);
          }
        } catch (innerE2) {
          console.error("Still exceeding quota after cleanup, throwing error so Firebase can handle it.");
          throw innerE2;
        }
      } else {
        throw e;
      }
    }
  };
} catch (e) {
  console.warn("Failed to intercept Storage.prototype.setItem", e);
}

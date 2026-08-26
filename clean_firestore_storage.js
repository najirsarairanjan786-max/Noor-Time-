import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const cleanupCode = `
// Cleanup any stuck Firestore offline persistence data from localStorage
try {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('firestore_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
} catch (e) {
  console.warn("Failed to clean up firestore local storage", e);
}
`;

if (!content.includes('keysToRemove.push(key)')) {
  content = content.replace('// Helper to get settings from local storage', cleanupCode + '\\n// Helper to get settings from local storage');
  fs.writeFileSync('src/lib/firebase.ts', content);
}

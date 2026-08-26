const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

// Ensure memoryLocalCache is imported
if (!content.includes('memoryLocalCache')) {
  content = content.replace('initializeFirestore, setLogLevel', 'initializeFirestore, setLogLevel, memoryLocalCache');
}

// Ensure it's passed to initializeFirestore
content = content.replace(
  /initializeFirestore\(app, \{ experimentalForceLongPolling: true \}, (.*?)\);/,
  'initializeFirestore(app, { experimentalForceLongPolling: true, localCache: memoryLocalCache() }, $1);'
);

fs.writeFileSync('src/lib/firebase.ts', content);

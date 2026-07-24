const fs = require('fs');
const file = 'src/pages/SettingsView.tsx';
let content = fs.readFileSync(file, 'utf8');

const offlineSection = `
      <div className="glass-panel p-2 mb-4">
        <div className="p-4 border-b border-emerald-800/40">
          <h3 className="text-lg font-bold text-white mb-2">Offline Mode</h3>
          <p className="text-sm text-emerald-300/80 mb-4">Cache essential Islamic content for offline use.</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-emerald-100">
              <div className="font-medium">Enable Offline Mode</div>
            </div>
            <button
              onClick={() => setOfflineMode(!isOfflineMode)}
              className={\`w-12 h-6 rounded-full transition-colors relative \${isOfflineMode ? "bg-emerald-500" : "bg-emerald-900"}\`}
            >
              <div className={\`w-4 h-4 rounded-full bg-white absolute top-1 transition-all \${isOfflineMode ? "left-7" : "left-1"}\`}></div>
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadOfflineData}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-medium py-2 rounded-xl border border-emerald-500/30 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Downloading..." : "Download Data for Offline Use"}
            </button>
            
            {isDownloading && (
              <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: \`\${downloadProgress}%\` }}></div>
              </div>
            )}
            
            <button
              onClick={downloadOfflineData}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-medium py-2 rounded-xl border border-emerald-500/20 transition disabled:opacity-50 text-sm"
            >
              Update Offline Data
            </button>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-emerald-800/30">
              <span>Cache Size: {cacheSize}</span>
              <button onClick={clearOfflineData} className="text-red-400 hover:text-red-300 underline">Clear Cache</button>
            </div>
            
            {lastSyncDate && (
              <div className="text-[10px] text-center text-slate-500 mt-1">
                Last updated: {new Date(lastSyncDate).toLocaleString()}
              </div>
            )}
            {!lastSyncDate && (
               <div className="text-[10px] text-center text-slate-500 mt-1">
                Please connect to the internet once to download offline content.
              </div>
            )}
          </div>
        </div>
      </div>
`;

content = content.replace(
  /<LocationPickerModal/g,
  offlineSection + '\n      <LocationPickerModal'
);

fs.writeFileSync(file, content);

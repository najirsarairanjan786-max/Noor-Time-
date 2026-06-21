import { useState } from "react";
import { ArrowLeft, Download, ShieldCheck, Smartphone, Settings, Info, Star, ChevronRight } from "lucide-react";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "../hooks/useSettings";
// Provide the path to the app logo (it could be an existing public graphic or we'll use a placeholder/lucide icon)
import { MoonStar } from "lucide-react"; 

export function DownloadApkView({ setView }: { setView: (view: string) => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const handleDownload = () => {
    setDownloadProgress(0);
    // Simulate a download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          triggerFakeDownload();
          setTimeout(() => setDownloadProgress(null), 2000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
  };

  const triggerFakeDownload = () => {
    // Generate a dummy blob to trigger the browser's download functionality
    const blob = new Blob(["This is a placeholder for the actual Noor Time APK."], { type: "application/vnd.android.package-archive" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Noor_Time_v1.0.apk";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-white flex flex-col pb-24 h-full overflow-y-auto w-full">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 bg-gradient-to-b from-emerald-900/40 to-transparent sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("home")}
            className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Download App
            </h1>
            <p className="text-emerald-200/60 text-sm">Install on Android</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 space-y-6">
        
        {/* App Info Card */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-black/30 border border-emerald-800/50 rounded-[2rem] p-6 text-center shadow-lg relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 blur-2xl rounded-full"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/50 border border-emerald-400/30 relative z-10">
            <MoonStar className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Noor Time</h2>
          <div className="flex items-center gap-3 text-emerald-200/70 text-sm mb-6 relative z-10 font-medium">
            <span className="bg-black/40 px-3 py-1 rounded-full border border-emerald-800/50">v1.2.0</span>
            <span className="w-1 h-1 bg-emerald-500/50 rounded-full"></span>
            <span className="bg-black/40 px-3 py-1 rounded-full border border-emerald-800/50">24.5 MB</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloadProgress !== null}
            className={`w-full relative z-10 rounded-2xl p-4 font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden ${
              downloadProgress !== null
                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                : "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-900/50"
            }`}
          >
            {downloadProgress !== null ? (
              <>
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-300"
                  style={{ width: `${Math.min(downloadProgress, 100)}%` }}
                />
                <span className="relative z-10">Downloading {Math.min(downloadProgress, 100)}%</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                Download APK
              </>
            )}
          </button>
        </div>

        {/* Features List */}
        <div className="bg-black/20 border border-emerald-800/30 rounded-3xl p-5 space-y-4">
          <h3 className="text-emerald-400 font-semibold mb-2">Key Features</h3>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center flex-shrink-0 border border-emerald-800/50">
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-50">Ad-Free Experience</h4>
              <p className="text-emerald-200/60 text-xs mt-1">Enjoy distraction-free prayers and Quran reading with zero ads.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-900/40 flex items-center justify-center flex-shrink-0 border border-teal-800/50">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-50">Offline Support</h4>
              <p className="text-emerald-200/60 text-xs mt-1">Read the Quran and access Athkar without needing an internet connection.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 flex items-center justify-center flex-shrink-0 border border-blue-800/50">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-emerald-50">Battery Optimized</h4>
              <p className="text-emerald-200/60 text-xs mt-1">Designed to run in the background efficiently for prayer alerts.</p>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-black/20 border border-emerald-800/30 rounded-3xl p-5">
          <h3 className="text-emerald-400 font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" /> 
            How to Install
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0 mt-0.5">1</div>
              <p className="text-sm text-emerald-100/80">Download the APK file using the button above.</p>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0 mt-0.5">2</div>
              <div className="text-sm text-emerald-100/80">
                Go to <span className="text-white font-medium">Settings</span> {">"} <span className="text-white font-medium">Security</span> {">"} <span className="text-white font-medium">Unknown Sources</span> and enable it.
                <div className="mt-2 text-xs text-yellow-400/80 bg-yellow-900/20 p-2 rounded-lg border border-yellow-700/30">
                  Note: On newer Android versions, your browser will ask for permission specifically.
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-xs font-bold text-emerald-300 flex-shrink-0 mt-0.5">3</div>
              <p className="text-sm text-emerald-100/80">Open the downloaded file and tap <span className="text-white font-medium">Install</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

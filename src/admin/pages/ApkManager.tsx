import { useState, useEffect } from "react";
import { Upload, Smartphone, Save } from "@/src/lib/icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function ApkManager() {
  const [release, setRelease] = useState({
    version: "1.0.0",
    url: "",
    size: "15 MB",
    notes: "Initial release",
    forceUpdate: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const docRef = doc(db, "apk_releases", "latest");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRelease(docSnap.data() as any);
        }
      } catch (e) {
        console.warn("Error fetching apk config: ", e);
      }
    };
    fetchRelease();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "apk_releases", "latest"), {
        ...release,
        createdAt: Date.now()
      });
      // Release info updated
    } catch (e) {
      console.error("Error saving apk release: ", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">APK Manager</h2>
          <p className="text-slate-500">Manage app updates and force-update rules</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Publish Update"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100">
            <Smartphone className="w-8 h-8 text-emerald-600" />
            <div>
              <h3 className="font-bold">Current Live Version</h3>
              <p className="text-sm opacity-80">Version {release.version}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Version Number</label>
              <input 
                type="text"
                value={release.version}
                onChange={(e) => setRelease({...release, version: e.target.value})}
                placeholder="e.g. 1.2.0"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">App Size</label>
              <input 
                type="text"
                value={release.size}
                onChange={(e) => setRelease({...release, size: e.target.value})}
                placeholder="e.g. 24 MB"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">APK Download Link</label>
            <div className="flex gap-2">
               <input 
                type="url"
                value={release.url}
                onChange={(e) => setRelease({...release, url: e.target.value})}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button className="px-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 font-medium flex items-center justify-center whitespace-nowrap">
                <Upload className="w-4 h-4 mr-2" /> Upload
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Upload your APK to Firebase Storage or copy a direct URL here.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Release Notes</label>
            <textarea 
              value={release.notes}
              onChange={(e) => setRelease({...release, notes: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="What's new in this update?"
            />
          </div>

          <div className="flex items-center gap-3">
             <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={release.forceUpdate} 
                onChange={(e) => setRelease({...release, forceUpdate: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <div>
              <p className="text-sm font-medium text-slate-800">Force Update Required</p>
              <p className="text-xs text-slate-500">If enabled, users must update to continue using the app.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

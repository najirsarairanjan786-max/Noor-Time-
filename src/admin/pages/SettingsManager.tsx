import { useState, useEffect } from "react";
import { Save, Settings, Image as ImageIcon } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function SettingsManager() {
  const [settings, setSettings] = useState({
    appName: "Noor Time",
    appLogo: "https://example.com/logo.png",
    splashScreen: "https://example.com/splash.png",
    admobAppId: "",
    admobBannerId: "",
    admobInterstitialId: "",
    socialLinks: "",
    contactInfo: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "app_settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (e) {
        console.warn("Error fetching settings: ", e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "app_settings", "global"), {
        ...settings,
        modifiedAt: Date.now()
      });
      // Settings saved successfully
    } catch (e) {
      console.error("Error saving settings: ", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">App Settings</h2>
          <p className="text-slate-500">Configure global application settings</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Branding */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Branding
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">App Name</label>
            <input 
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({...settings, appName: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={settings.appLogo}
                onChange={(e) => setSettings({...settings, appLogo: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Splash Screen URL</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={settings.splashScreen}
                onChange={(e) => setSettings({...settings, splashScreen: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Monetization */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="text-emerald-500 font-serif font-bold text-xl">$</span>
            Monetization (AdMob)
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">App ID</label>
            <input 
              type="text"
              value={settings.admobAppId}
              onChange={(e) => setSettings({...settings, admobAppId: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Banner Ad ID</label>
            <input 
              type="text"
              value={settings.admobBannerId}
              onChange={(e) => setSettings({...settings, admobBannerId: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Interstitial Ad ID</label>
            <input 
              type="text"
              value={settings.admobInterstitialId}
              onChange={(e) => setSettings({...settings, admobInterstitialId: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

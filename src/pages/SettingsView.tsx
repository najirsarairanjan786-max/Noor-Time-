import { motion } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { Moon, Bell, MapPin, Globe, Palette, Plus, Trash, Clock, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

import { useState, Dispatch, SetStateAction } from 'react';
import { ViewType } from '../App';
import { ThemeModal } from '../components/ThemeModal';

export function SettingsView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings, setSettings, requestLocation } = useSettings();
  const { user, signIn, logOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAlarmName, setNewAlarmName] = useState('');
  const [newAlarmTime, setNewAlarmTime] = useState('');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const addCustomAlarm = () => {
    if (newAlarmName && newAlarmTime) {
      setSettings(p => ({
        ...p,
        customAlarms: {
          ...(p.customAlarms || {}),
          [newAlarmName]: newAlarmTime,
        }
      }));
      setNewAlarmName('');
      setNewAlarmTime('');
    }
  };

  const removeCustomAlarm = (name: string) => {
    setSettings(p => {
      const newCustomAlarms = { ...(p.customAlarms || {}) };
      delete newCustomAlarms[name];
      return { ...p, customAlarms: newCustomAlarms };
    });
  };

  const handleGpsUpdate = async () => {
    try {
      setIsUpdating(true);
      await requestLocation();
    } catch (e) {
      alert("GPS location failed or blocked.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: localStorage.getItem('islamic-app-settings-v11'),
      alarms: localStorage.getItem('islamic-alarms-v2'),
      tracker: localStorage.getItem('dailySalahTracker'),
      tahajjudAlarm: localStorage.getItem('islamic-tahajjud-alarm'),
      exportDate: new Date().toISOString()
    };
    
    // Parse strings back to objects where necessary for cleaner JSON structure
    const parsedData = {
      settings: data.settings ? JSON.parse(data.settings) : null,
      alarms: data.alarms ? JSON.parse(data.alarms) : null,
      tracker: data.tracker ? JSON.parse(data.tracker) : null,
      tahajjudAlarm: data.tahajjudAlarm ? JSON.parse(data.tahajjudAlarm) : null,
      exportDate: data.exportDate
    };

    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prayer-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-32 px-4 pt-12 max-w-md mx-auto space-y-6 relative"
    >
      <button 
        onClick={() => setView('home')}
        className="absolute top-4 left-4 p-2 pl-1.5 bg-emerald-900/50 hover:bg-emerald-800/80 rounded-full text-emerald-100 transition-colors z-10 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
        <span className="text-sm font-medium pr-3">Back</span>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-emerald-300/80 mt-1">Configure your app experience</p>
      </div>

      <div className="glass-panel p-2">
        <div className="p-4 flex flex-col border-b border-emerald-800/40">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1 w-full relative">
              <div className="flex items-center gap-3 text-emerald-100">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-xs text-emerald-400/80">{settings.location?.name || 'Not set'}</div>
                </div>
              </div>
              <div className="flex flex-col mt-3 gap-2">
                <button 
                  onClick={handleGpsUpdate}
                  disabled={isUpdating}
                  type="button"
                  className="text-xs text-emerald-300 bg-emerald-900/50 px-3 py-1.5 rounded-full w-full hover:bg-emerald-800 transition shadow-sm border border-emerald-700/50 text-center disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update GPS Location"}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 ml-4 shrink-0 mt-2 self-start">
              <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider">Auto</span>
              <button 
                onClick={() => {
                  const newAuto = !settings.autoLocation;
                  setSettings(p => ({ ...p, autoLocation: newAuto }));
                  if (newAuto) requestLocation().catch((e) => alert("GPS failed."));
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoLocation ? 'bg-emerald-500' : 'bg-emerald-900'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.autoLocation ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3 text-emerald-100">
            <Bell className="w-5 h-5 text-emerald-400" />
            <div className="font-medium">Master Alarms</div>
          </div>
          <button 
            onClick={() => setSettings(p => ({ ...p, alarmsEnabled: !p.alarmsEnabled }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.alarmsEnabled ? 'bg-emerald-500' : 'bg-emerald-900'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.alarmsEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {settings.alarmsEnabled && (
          <>
            <div className="p-4 flex items-center justify-between border-b border-emerald-800/40 bg-emerald-900/10">
              <div className="flex items-center gap-3 text-emerald-100 ml-8">
                <div className="font-medium text-sm">Push Notifications</div>
              </div>
              <button 
                onClick={() => setSettings(p => ({ ...p, pushNotificationsEnabled: !p.pushNotificationsEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.pushNotificationsEnabled ? 'bg-emerald-500' : 'bg-emerald-900'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.pushNotificationsEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-2 border-b border-emerald-800/40 bg-emerald-900/10">
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then(permission => {
                      if (permission === 'granted') {
                        setSettings(p => ({ ...p, pushNotificationsEnabled: true }));
                        new Notification("Notifications Active", {
                          body: "Prayer alerts are working perfectly.",
                          icon: "/icon-192.png"
                        });
                      }
                    });
                  }
                  if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
                  
                  // Try playing a sound to unlock audio context
                  try {
                    let snd = settings.alarmSound === 'beep' ? 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3' : 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3';
                    new Audio(snd).play().catch(() => {});
                  } catch(e) {}
                }}
                className="py-2.5 px-4 bg-emerald-600/30 font-semibold text-emerald-300 text-xs rounded-lg border border-emerald-500/30 hover:bg-emerald-600/40 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" /> Request Permission & Test Alert
              </button>
              <p className="text-[10px] text-emerald-400/60 text-center uppercase tracking-widest px-4">
                Must be done manually to allow browser notifications and sound to play
              </p>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-emerald-800/40 bg-emerald-900/10">
              <div className="flex items-center gap-3 text-emerald-100 ml-8">
                <div className="font-medium text-sm">Alert Sound</div>
              </div>
              <select 
                value={settings.alarmSound}
                onChange={(e) => setSettings(p => ({...p, alarmSound: e.target.value as any}))}
                className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none"
              >
                <option value="beep">Beep</option>
                <option value="chime">Chime</option>
                <option value="azan-mecca">Makkah Adhan</option>
                <option value="azan-medina">Madinah Adhan</option>
                <option value="azan-al-aqsa">Al-Aqsa Adhan</option>
                <option value="azan-mishary">Mishary Adhan</option>
                <option value="azan-abdul-basit">Abdul Basit Adhan</option>
              </select>
            </div>

            <div className="p-4 flex items-center justify-between border-b border-emerald-800/40 bg-emerald-900/10">
              <div className="flex items-center gap-3 text-emerald-100 ml-8">
                <div className="font-medium text-sm">Pre-Alarm</div>
              </div>
              <select 
                value={settings.preAlarmMinutes}
                onChange={(e) => setSettings(p => ({...p, preAlarmMinutes: Number(e.target.value)}))}
                className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none"
              >
                <option value={0}>Off</option>
                <option value={5}>5 mins before</option>
                <option value={10}>10 mins before</option>
                <option value={15}>15 mins before</option>
              </select>
            </div>
            
            <div className="p-4 flex flex-col gap-2 border-b border-emerald-800/40 bg-emerald-900/10">
              <div className="flex items-center gap-3 text-emerald-100 ml-8 mb-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <div className="font-medium text-sm">Prayer Specific Sounds</div>
              </div>
              
              {['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'].map(prayer => (
                <div key={prayer} className="flex items-center justify-between ml-12 mr-4 bg-emerald-950 p-2 rounded-lg border border-emerald-800/50">
                  <span className="text-emerald-100 text-sm w-16">{prayer}</span>
                  <select 
                    value={settings.prayerAlarmSounds?.[prayer] || "default"}
                    onChange={(e) => setSettings(p => ({
                      ...p, 
                      prayerAlarmSounds: { ...(p.prayerAlarmSounds || {}), [prayer]: e.target.value } 
                    }))}
                    className="bg-emerald-950 border-none text-emerald-300 text-xs text-right outline-none cursor-pointer flex-1"
                  >
                    <option value="default">App Default</option>
                    <option value="beep">Beep</option>
                    <option value="chime">Chime</option>
                    <option value="azan-mecca">Makkah Adhan</option>
                    <option value="azan-medina">Madinah Adhan</option>
                    <option value="azan-al-aqsa">Al-Aqsa Adhan</option>
                    <option value="azan-mishary">Mishary Adhan</option>
                    <option value="azan-abdul-basit">Abdul Basit Adhan</option>
                  </select>
                </div>
              ))}
            </div>
            
            <div className="p-4 flex flex-col border-b border-emerald-800/40 bg-emerald-900/10">
              <div className="flex items-center gap-3 text-emerald-100 ml-8 mb-4">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div className="font-medium text-sm">Custom Alarms</div>
              </div>
              
              {/* List existing custom alarms */}
              {Object.entries(settings.customAlarms || {}).map(([name, time]) => (
                <div key={name} className="flex items-center justify-between ml-12 mr-4 mb-2 bg-emerald-950 p-2 rounded-lg border border-emerald-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-100 text-sm">{name}</span>
                    <span className="text-emerald-400/80 text-xs bg-emerald-900/50 px-2 py-0.5 rounded">{time}</span>
                  </div>
                  <button onClick={() => removeCustomAlarm(name)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add new custom alarm */}
              <div className="flex items-center gap-2 ml-12 mr-4 mt-2">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newAlarmName}
                  onChange={e => setNewAlarmName(e.target.value)}
                  className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none flex-1 min-w-0"
                />
                <input 
                  type="time" 
                  value={newAlarmTime}
                  onChange={e => setNewAlarmTime(e.target.value)}
                  className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none w-24 shrink-0"
                  style={{ colorScheme: 'dark' }}
                />
                <button 
                  onClick={addCustomAlarm}
                  disabled={!newAlarmName || !newAlarmTime}
                  className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-500 disabled:opacity-50 transition shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}

        <div className="p-4 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3 text-emerald-100">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div className="font-medium">Calculation Method</div>
          </div>
          <select 
            value={settings.method ?? 1}
            onChange={(e) => setSettings(p => ({...p, method: Number(e.target.value)}))}
            className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none max-w-[150px]"
          >
            <option value={1}>Karachi (Univ. of Islamic Sciences)</option>
            <option value={2}>ISNA (North America)</option>
            <option value={3}>MWL (Europe, Far East)</option>
            <option value={4}>Umm al-Qura (Makkah)</option>
            <option value={5}>Egyptian General Auth</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3 text-emerald-100">
            <Globe className="w-5 h-5 text-emerald-400 opacity-50" />
            <div className="font-medium text-sm">Asr Method</div>
          </div>
          <select 
            value={settings.school ?? 1}
            onChange={(e) => setSettings(p => ({...p, school: Number(e.target.value)}))}
            className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none"
          >
            <option value={1}>Hanafi (Later)</option>
            <option value={0}>Standard (Shafi, Maliki, Hanbali)</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3 text-emerald-100">
            <Moon className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="font-medium">Hijri Adjustment</div>
              <div className="text-[10px] text-emerald-400/60 uppercase">Date changes at 7 PM</div>
            </div>
          </div>
          <select 
            value={settings.hijriOffset ?? 0}
            onChange={(e) => {
              localStorage.setItem('user_set_offset', 'true');
              setSettings(p => ({...p, hijriOffset: Number(e.target.value)}));
            }}
            className="bg-emerald-950 border border-emerald-800 text-emerald-100 text-sm rounded-lg p-2 outline-none"
          >
            <option value={-2}>-2 Days</option>
            <option value={-1}>-1 Day</option>
            <option value={0}>Standard (Auto)</option>
            <option value={1}>+1 Day</option>
            <option value={2}>+2 Days</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-800/20 transition" onClick={() => setIsThemeModalOpen(true)}>
          <div className="flex items-center gap-3 text-emerald-100">
            <Palette className="w-5 h-5 text-emerald-400" />
            <div className="font-medium">Theme Style</div>
          </div>
          <div className="px-4 py-1.5 bg-emerald-950 border border-emerald-800 rounded-full text-sm text-emerald-300 opacity-80 capitalize">
            {settings.theme} Mode
          </div>
        </div>
        
        <div className="p-4 flex flex-col border-t border-emerald-800/40">
          <h3 className="text-emerald-100 font-medium mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" /> Database Sync
          </h3>
          <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-800/50">
            {user ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-emerald-300 font-medium">Logged in as {user.displayName || user.email}</p>
                <div className="flex gap-2">
                   <button onClick={() => setView('profile')} className="py-2 px-4 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-900/20 flex-1">
                     Manage Profile
                   </button>
                   <button onClick={logOut} className="py-2 px-4 bg-emerald-900/50 text-red-400 text-xs font-semibold rounded hover:bg-red-900/30 hover:text-red-300 transition-colors border border-red-500/10 flex-1">
                     Sign Out
                   </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-emerald-400/80 mb-1 leading-relaxed">
                  Sign in to seamlessly synchronize your app preferences, alarms, and daily trackers across multiple devices via Firebase.
                </p>
                <button 
                  onClick={() => setView('profile')} 
                  className="py-2 px-4 bg-emerald-600 text-white text-xs font-bold rounded-lg overflow-hidden hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-900/20 w-full"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col border-t border-emerald-800/40 rounded-b-xl">
          <h3 className="text-emerald-100 font-medium mb-3 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" /> Data Backup
          </h3>
          <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-800/50">
            <p className="text-xs text-emerald-400/80 mb-3 leading-relaxed">
              Export your prayer history and app preferences as a JSON file you can keep securely offline.
            </p>
            <button 
              onClick={handleExportData} 
              className="py-2 px-4 bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded hover:bg-emerald-800/80 transition-colors border border-emerald-800 flex items-center justify-center gap-2 w-full"
            >
              <Download className="w-4 h-4" /> Export JSON Backup
            </button>
          </div>
        </div>
      </div>
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </motion.div>
  );
}

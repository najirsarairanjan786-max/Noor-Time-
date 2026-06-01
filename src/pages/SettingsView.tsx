import { motion } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { Moon, Bell, MapPin, Globe, Palette, Plus, Trash, Clock } from 'lucide-react';

import { useState } from 'react';
import { ThemeModal } from '../components/ThemeModal';

export function SettingsView() {
  const { settings, setSettings, requestLocation } = useSettings();
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-32 px-4 pt-12 max-w-md mx-auto space-y-6"
    >
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

        <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-800/20 rounded-b-xl transition" onClick={() => setIsThemeModalOpen(true)}>
          <div className="flex items-center gap-3 text-emerald-100">
            <Palette className="w-5 h-5 text-emerald-400" />
            <div className="font-medium">Theme Style</div>
          </div>
          <div className="px-4 py-1.5 bg-emerald-950 border border-emerald-800 rounded-full text-sm text-emerald-300 opacity-80 capitalize">
            {settings.theme} Mode
          </div>
        </div>
      </div>
      <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </motion.div>
  );
}

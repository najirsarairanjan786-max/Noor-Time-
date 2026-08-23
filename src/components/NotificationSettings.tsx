import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Info } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { NotificationService } from '../lib/notifications';
import { useLocalStorage } from 'usehooks-ts';

export function NotificationSettings() {
  const { settings, setSettings } = useSettings();
  const [permission, setPermission] = useState<string>(NotificationService.getPermissionStatus());
  
  // existing prayer toggles stored in islamic-alarms-v2
  

  const handleRequestPermission = async () => {
    const perm = await NotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      setSettings(s => ({ ...s, pushNotificationsEnabled: true }));
    } else {
      setSettings(s => ({ ...s, pushNotificationsEnabled: false }));
    }
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      alert("Notifications are disabled. Please allow notifications first.");
      return;
    }
    NotificationService.sendTestNotification();
  };

  const togglePrayer = (name: string) => {
    setSettings(prev => ({ ...prev, prayerAlarms: { ...(prev.prayerAlarms || {}), [name]: !(prev.prayerAlarms?.[name] ?? true) } }));
  };

  const isUnsupported = permission === 'unsupported';

  return (
    <div className="space-y-6 text-emerald-100">
      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-800/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Master Notifications
        </h3>
        
        {isUnsupported ? (
          <div className="text-amber-400 bg-amber-900/20 p-4 rounded-xl text-sm">
            Push notifications are not supported on this browser/device.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Enable Notifications</div>
                <div className="text-xs text-emerald-300/80 mt-1">Receive alerts for prayers and events</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, pushNotificationsEnabled: !s.pushNotificationsEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.pushNotificationsEnabled ? "bg-emerald-500" : "bg-emerald-900/60"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${settings.pushNotificationsEnabled ? "left-7" : "left-1"}`}></div>
              </button>
            </div>

            <div className="pt-2 border-t border-emerald-800/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status: <strong className={permission === 'granted' ? 'text-emerald-400' : 'text-red-400'}>{permission.toUpperCase()}</strong></span>
                {permission !== 'granted' && (
                  <button onClick={handleRequestPermission} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg font-medium transition active:scale-95">
                    Allow Notifications
                  </button>
                )}
              </div>
              {permission === 'denied' && (
                <div className="text-xs text-red-300 flex items-start gap-1 mt-1 bg-red-900/20 p-2 rounded">
                  <Info className="w-4 h-4 shrink-0" />
                  Notifications are blocked. Please enable them from your browser/site settings.
                </div>
              )}
              {permission !== 'granted' && permission !== 'denied' && (
                <div className="text-xs text-emerald-300/60 mt-1">
                  Allow notifications to receive prayer times, reminders and important Noor Time updates.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button onClick={handleTestNotification} className="w-full py-2.5 bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-100 text-sm rounded-xl font-medium transition active:scale-95 border border-emerald-700/50">
                Send Test Notification
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-800/50">
        <h3 className="text-lg font-bold text-white mb-4">Prayer Notifications</h3>
        <div className="space-y-4">
          {['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
            <div key={prayer} className="flex items-center justify-between">
              <div className="font-medium text-sm">{prayer === 'Zuhr' ? 'Dhuhr' : prayer}</div>
              <button
                onClick={() => togglePrayer(prayer)}
                className={`w-10 h-5 rounded-full transition-colors relative ${(settings.prayerAlarms?.[prayer] ?? true) !== false ? "bg-emerald-500" : "bg-emerald-900/60"}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${(settings.prayerAlarms?.[prayer] ?? true) !== false ? "left-5.5" : "left-1"}`}></div>
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-800/50">
            <div className="font-medium text-sm">Sunrise</div>
            <button
              onClick={() => setSettings(s => ({ ...s, sunriseReminder: !s.sunriseReminder }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.sunriseReminder ? "bg-emerald-500" : "bg-emerald-900/60"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.sunriseReminder ? "left-5.5" : "left-1"}`}></div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-800/50">
        <h3 className="text-lg font-bold text-white mb-4">Other Reminders</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">Jumu'ah Reminder</div>
            <button
              onClick={() => setSettings(s => ({ ...s, jummahReminder: !s.jummahReminder }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.jummahReminder ? "bg-emerald-500" : "bg-emerald-900/60"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.jummahReminder ? "left-5.5" : "left-1"}`}></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">Daily Reminder</div>
            <button
              onClick={() => setSettings(s => ({ ...s, dailyReminder: !s.dailyReminder }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.dailyReminder ? "bg-emerald-500" : "bg-emerald-900/60"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.dailyReminder ? "left-5.5" : "left-1"}`}></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">Quran Reminder</div>
            <button
              onClick={() => setSettings(s => ({ ...s, quranReminder: !s.quranReminder }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.quranReminder ? "bg-emerald-500" : "bg-emerald-900/60"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.quranReminder ? "left-5.5" : "left-1"}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-medium text-sm">Dhikr / Tasbeeh Reminder</div>
            <button
              onClick={() => setSettings(s => ({ ...s, tasbeehReminder: !s.tasbeehReminder }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${settings.tasbeehReminder ? "bg-emerald-500" : "bg-emerald-900/60"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${settings.tasbeehReminder ? "left-5.5" : "left-1"}`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

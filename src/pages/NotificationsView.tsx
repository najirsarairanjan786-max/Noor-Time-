import { motion } from "motion/react";
import { ArrowLeft, Bell } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ViewType } from "../App";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "../hooks/useSettings";

export function NotificationsView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);

  // We can add mock notifications here or a placeholder if empty
  const mockNotifications = [
    {
      id: 1,
      title: "New feature available!",
      message: "Check out the new Madani Radio in the side menu.",
      date: "Today, 10:00 AM",
      read: false
    },
    {
      id: 2,
      title: "Prayer Time Update",
      message: "Asr time will shift by 5 minutes starting tomorrow.",
      date: "Yesterday, 2:30 PM",
      read: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute inset-0 z-50 bg-emerald-950 flex flex-col"
    >
      <div className="p-4 flex items-center gap-4 bg-emerald-900 shadow-md z-10">
        <button
          onClick={() => setView("home")}
          className="p-2 -ml-2 rounded-full hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-100" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          {t('notification') || 'Notifications'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {mockNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-4 rounded-xl border transition-colors ${notification.read ? 'bg-emerald-900/30 border-emerald-800/30' : 'bg-emerald-900 border-emerald-500/30'}`}
          >
            <div className="flex items-start justify-between">
              <h3 className={`font-medium text-sm ${notification.read ? 'text-emerald-100' : 'text-white'}`}>
                {notification.title}
              </h3>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1"></div>
              )}
            </div>
            <p className="text-xs text-emerald-200/70 mt-1">{notification.message}</p>
            <div className="text-[10px] text-emerald-500/70 mt-3 font-medium">
              {notification.date}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

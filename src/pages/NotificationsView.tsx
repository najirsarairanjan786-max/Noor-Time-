import { motion } from "motion/react";
import { ArrowLeft, Bell } from "@/src/lib/icons";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { ViewType } from "../App";
import { useTranslation } from "../lib/i18n";
import { useSettings } from "../hooks/useSettings";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export function NotificationsView({ setView }: { setView: Dispatch<SetStateAction<ViewType>> }) {
  const { settings } = useSettings();
  const { t } = useTranslation(settings.language);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
        return timeB - timeA;
      });
      setNotifications(data);
    });
    return unsubscribe;
  }, []);

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
        {notifications.length === 0 ? (
          <div className="text-center text-emerald-200/50 mt-10">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-xl border transition-colors bg-emerald-900 border-emerald-500/30`}
            >
              <div className="flex items-start justify-between">
                <h3 className={`font-medium text-sm text-white`}>
                  {notification.title}
                </h3>
              </div>
              <p className="text-xs text-emerald-200/70 mt-1">{notification.message}</p>
              <div className="text-[10px] text-emerald-500/70 mt-3 font-medium">
                {typeof notification.createdAt === 'number' ? new Date(notification.createdAt).toLocaleString() : (notification.createdAt?.toDate ? new Date(notification.createdAt.toDate()).toLocaleString() : "Just now")}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { Plus, Bell, Search, Edit2, Trash2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notification Center</h2>
          <p className="text-slate-500">Send push notifications to all users</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          New Notification
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-4">Title & Message</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No notifications sent yet.</p>
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-medium text-slate-800 line-clamp-1">{notif.title}</p>
                      <p className="text-slate-500 line-clamp-1">{notif.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        notif.status === 'sent' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


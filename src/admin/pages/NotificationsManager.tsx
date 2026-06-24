import { useState, useEffect } from "react";
import { Plus, Bell, Search, Edit2, Trash2, X } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setNotifications(data);
    });
    return unsubscribe;
  }, []);

  const handleDeleteNotification = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteDoc(doc(db, "notifications", id));
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "notifications"), {
        ...newNotification,
        category: "general",
        scheduledFor: serverTimestamp(),
        status: "sent",
        createdAt: serverTimestamp(),
      });
      setIsAddModalOpen(false);
      setNewNotification({ title: "", message: "" });
    } catch (error) {
      console.error("Error adding notification: ", error);
      alert("Error adding notification. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notification Center</h2>
          <p className="text-slate-500">Send push notifications to all users</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Notification
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Send Notification</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" required
                  value={newNotification.title} onChange={e => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  required rows={3}
                  value={newNotification.message} onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                ></textarea>
              </div>
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-6"
              >
                {isSubmitting ? "Sending..." : "Send Notification"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        <button 
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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


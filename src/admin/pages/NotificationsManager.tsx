import { useState, useEffect } from "react";
import { Plus, Bell, Search, Edit2, Trash2, X, CheckCircle, AlertCircle } from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

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

  const handleDeleteNotification = async (id: string) => {
    setStatusMsg({ type: "", text: "" });
    try {
      await deleteDoc(doc(db, "notifications", id));
      setStatusMsg({ type: "success", text: "Notification deleted successfully!" });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      setStatusMsg({ type: "error", text: "Error deleting notification: " + (error.message || "Unknown error") });
    }
  };

  const handleAddNotification = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ type: "", text: "" });
    try {
      const payload = {
        ...newNotification,
        category: "general",
        scheduledFor: serverTimestamp(),
        status: "pending",
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, "notifications"), payload);
      
      try {
        const response = await fetch("/api/send-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationId: docRef.id }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to send push notifications");
        }
        
        setStatusMsg({ type: "success", text: "Push notification sent successfully to devices!" });
      } catch (apiError: any) {
        console.error("API Error:", apiError);
        setStatusMsg({ type: "error", text: "Notification saved to history but push delivery failed: " + apiError.message });
        await updateDoc(docRef, { status: "failed" });
      }
      
      setIsAddModalOpen(false);
      setNewNotification({ title: "", message: "" });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 8000);
    } catch (error: any) {
      console.error("Error adding notification: ", error);
      setStatusMsg({ type: "error", text: "Error sending notification: " + (error.message || "Unknown error") });
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

      {statusMsg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {statusMsg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p className="font-medium">{statusMsg.text}</p>
        </div>
      )}

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


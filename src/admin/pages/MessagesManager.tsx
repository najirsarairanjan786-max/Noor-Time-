import { useState, useEffect } from "react";
import { Mail, Search, CheckCircle, Clock } from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function MessagesManager() {
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "unread", "read"

  useEffect(() => {
    const q = query(collection(db, "contact_messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort in memory
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setMessages(data);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, "contact_messages", id), {
        status: currentStatus === "read" ? "unread" : "read"
      });
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "unread") return matchesSearch && msg.status === "unread";
    if (filter === "read") return matchesSearch && msg.status === "read";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contact Messages</h2>
          <p className="text-slate-500">View and manage messages from users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{msg.name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${msg.email}`} className="hover:text-emerald-600">
                        {msg.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 max-w-md">
                      {msg.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      msg.status === 'read' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {msg.status === 'read' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {msg.status === 'read' ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button 
                      onClick={() => handleMarkAsRead(msg.id, msg.status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        msg.status === 'read' 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {msg.status === 'read' ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <a 
                      href={`mailto:${msg.email}?subject=Reply to your message: ${msg.message.substring(0, 20)}...`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      Reply via Email
                    </a>
                  </td>
                </tr>
              ))}

              {filteredMessages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No messages found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

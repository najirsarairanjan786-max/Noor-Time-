import { useState, useEffect } from "react";
import { Plus, BookText, Search, Edit2, Trash2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

export function ContentManager() {
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "content"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContent(data);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Content Management</h2>
          <p className="text-slate-500">Manage Hadith, Quotes, and Articles</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Add Content
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {content.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <BookText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No content added yet.</p>
                  </td>
                </tr>
              ) : (
                content.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium capitalize">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
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


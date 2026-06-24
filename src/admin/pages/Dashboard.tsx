import { useState, useEffect } from "react";
import { Users, Download, Video, ShoppingBag, Bell, Activity } from "lucide-react";
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface RecentActivity {
  id: string;
  type: 'user' | 'video' | 'product' | 'notification';
  title: string;
  time: number;
  icon: any;
  color: string;
  bg: string;
}

export function Dashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    videos: 0,
    products: 0,
    notifications: 0,
    installs: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchCount = async (colName: string) => {
          try {
            const snap = await getCountFromServer(collection(db, colName));
            return snap.data().count;
          } catch (e) {
            console.error(`Error counting ${colName}:`, e);
            return 0;
          }
        };

        const fetchDocs = async (colName: string, orderField: string) => {
          try {
            return await getDocs(query(collection(db, colName), orderBy(orderField, "desc"), limit(3)));
          } catch (e) {
            console.error(`Error fetching docs ${colName}:`, e);
            return { forEach: () => {} }; // Return dummy snapshot
          }
        };

        const [
          usersCount,
          videosCount,
          productsCount,
          notificationsCount,
          installsCount,
          usersDocs,
          videosDocs,
          productsDocs,
          notificationsDocs,
          installsDocs
        ] = await Promise.all([
          fetchCount("users"),
          fetchCount("videos"),
          fetchCount("products"),
          fetchCount("notifications"),
          fetchCount("app_installs"),
          fetchDocs("users", "updatedAt"),
          fetchDocs("videos", "createdAt"),
          fetchDocs("products", "createdAt"),
          fetchDocs("notifications", "createdAt"),
          fetchDocs("app_installs", "timestamp")
        ]);

        setCounts({
          users: usersCount,
          videos: videosCount,
          products: productsCount,
          notifications: notificationsCount,
          installs: installsCount,
        });

        const activities: RecentActivity[] = [];

        installsDocs.forEach((doc: any) => {
          activities.push({
            id: `install_${doc.id}`,
            type: 'user' as any,
            title: `New app installation`,
            time: doc.data().timestamp || Date.now(),
            icon: Download,
            color: 'text-emerald-500',
            bg: 'bg-emerald-100'
          });
        });

        usersDocs.forEach(doc => {
          activities.push({
            id: `user_${doc.id}`,
            type: 'user',
            title: `New user joined: ${doc.data().firstName || 'Someone'}`,
            time: doc.data().updatedAt || Date.now(),
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-100'
          });
        });

        videosDocs.forEach(doc => {
          activities.push({
            id: `video_${doc.id}`,
            type: 'video',
            title: `Video added: ${doc.data().title || 'Untitled'}`,
            time: doc.data().createdAt || Date.now(),
            icon: Video,
            color: 'text-purple-500',
            bg: 'bg-purple-100'
          });
        });

        productsDocs.forEach(doc => {
          activities.push({
            id: `product_${doc.id}`,
            type: 'product',
            title: `Product listed: ${doc.data().name || 'Unnamed'}`,
            time: doc.data().createdAt || Date.now(),
            icon: ShoppingBag,
            color: 'text-orange-500',
            bg: 'bg-orange-100'
          });
        });

        notificationsDocs.forEach(doc => {
          activities.push({
            id: `notif_${doc.id}`,
            type: 'notification',
            title: `Notification sent: ${doc.data().title || 'Update'}`,
            time: doc.data().createdAt || Date.now(),
            icon: Bell,
            color: 'text-red-500',
            bg: 'bg-red-100'
          });
        });

        activities.sort((a, b) => b.time - a.time);
        setRecentActivities(activities.slice(0, 10));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Total Users", value: loading ? "..." : counts.users.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "App Downloads", value: loading ? "..." : counts.installs.toString(), icon: Download, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Videos", value: loading ? "..." : counts.videos.toString(), icon: Video, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Store Products", value: loading ? "..." : counts.products.toString(), icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Notifications Sent", value: loading ? "..." : counts.notifications.toString(), icon: Bell, color: "text-red-500", bg: "bg-red-50" },
  ];

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `Just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome to Noor Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading recent activity...
            </div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center ${activity.color} font-bold`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                      <p className="text-xs text-slate-500">{formatTimeAgo(activity.time)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              No recent activity to show.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

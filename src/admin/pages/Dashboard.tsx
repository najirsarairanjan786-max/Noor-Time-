import { Users, Download, Video, ShoppingBag, Bell, Activity } from "lucide-react";

export function Dashboard() {
  const stats = [
    { label: "Total Users", value: "1,248", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "App Downloads", value: "8,593", icon: Download, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Total Videos", value: "156", icon: Video, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Store Products", value: "48", icon: ShoppingBag, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Notifications Sent", value: "342", icon: Bell, color: "text-red-500", bg: "bg-red-50" },
  ];

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
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Admin updated app settings</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

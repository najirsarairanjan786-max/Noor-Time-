import { ReactNode } from "react";
import { LayoutDashboard, Video, ShoppingBag, Smartphone, Bell, BookText, Users, Settings, BarChart, LogOut, Menu, Mail } from "lucide-react";
import { AdminView } from "../AdminApp";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
}

export function AdminLayout({ children, currentView, setCurrentView }: AdminLayoutProps) {
  const { logOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: { id: AdminView; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "videos", label: "Videos", icon: Video },
    { id: "store", label: "Islamic Store", icon: ShoppingBag },
    { id: "apk", label: "APK Manager", icon: Smartphone },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "content", label: "Content", icon: BookText },
    { id: "messages", label: "Messages", icon: Mail },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-white transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-emerald-400">Noor Admin</h1>
            <p className="text-emerald-200/70 text-sm">Super Admin Panel</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? "bg-emerald-600 text-white" 
                      : "text-emerald-100/70 hover:bg-emerald-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-emerald-900">
            <button
              onClick={logOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar for Mobile */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center lg:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-slate-800">Noor Admin</h2>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

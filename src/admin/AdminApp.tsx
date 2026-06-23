import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminLayout } from "./components/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { VideosManager } from "./pages/VideosManager";
import { StoreManager } from "./pages/StoreManager";
import { ApkManager } from "./pages/ApkManager";
import { NotificationsManager } from "./pages/NotificationsManager";
import { ContentManager } from "./pages/ContentManager";
import { UsersManager } from "./pages/UsersManager";
import { SettingsManager } from "./pages/SettingsManager";
import { ReportsAnalytics } from "./pages/ReportsAnalytics";
import { MessagesManager } from "./pages/MessagesManager";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export type AdminView = 
  | "dashboard"
  | "videos"
  | "store"
  | "apk"
  | "notifications"
  | "content"
  | "users"
  | "settings"
  | "reports"
  | "messages";

export function AdminApp() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");

  useEffect(() => {
    if (loading) return;
    
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // AI Studio explicit email check
        if (user.email === "naziralquran786@gmail.com") {
          setIsAdmin(true);
          try {
            // Ensure the user is saved as a superadmin in Firestore
            const { setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "admins", user.email), {
              role: "superadmin",
              active: true
            }, { merge: true });
          } catch (e) {
            console.error("Failed to set admin role", e);
          }
          return;
        }

        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          // Also check by email just in case
          const adminEmailDoc = await getDoc(doc(db, "admins", user.email || ""));
          setIsAdmin(adminEmailDoc.exists());
        }
      } catch (err) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user, loading]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && !isAdmin) {
    // Redirect normal users to the main app
    window.location.href = "/";
    return null;
  }

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout currentView={currentView} setCurrentView={setCurrentView}>
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "videos" && <VideosManager />}
      {currentView === "store" && <StoreManager />}
      {currentView === "apk" && <ApkManager />}
      {currentView === "notifications" && <NotificationsManager />}
      {currentView === "content" && <ContentManager />}
      {currentView === "users" && <UsersManager />}
      {currentView === "settings" && <SettingsManager />}
      {currentView === "reports" && <ReportsAnalytics />}
      {currentView === "messages" && <MessagesManager />}
    </AdminLayout>
  );
}

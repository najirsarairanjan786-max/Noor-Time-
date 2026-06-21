import { createClient } from "@supabase/supabase-js";

// Helper to get settings from local storage
function getSettings() {
  try {
    const raw = localStorage.getItem("islamic-app-settings-v11");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse settings", e);
  }
  return {};
}

// Zoya/Noor will use this to remember conversations
export const getSupabaseClient = () => {
  const settings = getSettings();
  const supabaseUrl = settings.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = settings.supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

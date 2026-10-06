import "@/lib/polyfills";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!url && !!anon;

// A placeholder keeps the app booting (and showing a clear setup screen) before .env is filled in.
export const supabase = createClient(url || "https://placeholder.supabase.co", anon || "placeholder", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // deep links are handled explicitly in app/auth/callback.tsx
    flowType: "pkce", // same flow the web app uses (@supabase/ssr)
  },
});

// Only refresh tokens while the app is in the foreground (Supabase's recommendation for React Native).
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

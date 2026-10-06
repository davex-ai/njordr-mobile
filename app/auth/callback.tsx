import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/components/useTheme";
import { safeNext } from "@/lib/format";
import { supabase } from "@/lib/supabase";

// Handles the njordr://auth/callback?code=... deep link (e.g. the email-confirmation link).
// Mirrors the web app's /auth/callback route handler.
export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useTheme();
  const { code, next } = useLocalSearchParams<{ code?: string; next?: string }>();

  useEffect(() => {
    (async () => {
      const target = safeNext(next) ?? "/";
      // The Google flow may already have exchanged this code in login.tsx.
      const { data } = await supabase.auth.getSession();
      if (data.session) return router.replace(target);
      if (typeof code === "string") {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return router.replace(target);
      }
      router.replace({ pathname: "/login", params: { error: "auth" } });
    })();
  }, [code, next, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

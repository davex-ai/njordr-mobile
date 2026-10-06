import "react-native-reanimated";
import "../global.css";

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  useFonts,
} from "@expo-google-fonts/geist";
import { DefaultTheme, DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { toCssVars } from "@/constants/theme";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = { initialRouteName: "(tabs)" };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync(); // a font failure shouldn't brick the app; system font is used
  }, [loaded, error]);

  if (!loaded && !error) return null;
  return <Shell />;
}

function Shell() {
  const { scheme, colors } = useTheme();
  const themeVars = useMemo(() => vars(toCssVars(colors)), [colors]);

  const navTheme = useMemo(() => {
    const base = scheme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.background,
        card: colors.background,
        text: colors.foreground,
        border: colors.line,
      },
    };
  }, [scheme, colors]);

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, themeVars]}>
      <StatusBar style="auto" />
      {isSupabaseConfigured ? (
        <ThemeProvider value={navTheme}>
          <AuthProvider>
            <CartProvider>
              <Nav />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      ) : (
        <SetupNeeded />
      )}
    </View>
  );
}

function Nav() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Geist_600SemiBold" },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="products/[id]" options={{ title: "" }} />
      <Stack.Screen name="login" options={{ title: "" }} />
      <Stack.Screen name="info/[slug]" options={{ title: "" }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}

function SetupNeeded() {
  return (
    <View className="flex-1 justify-center bg-background p-6">
      <View className="rounded-2xl border border-line bg-surface p-6">
        <Text className="text-xl font-semibold">Almost there</Text>
        <Text className="mt-2 text-muted">
          Supabase isn't configured yet. Copy <Text className="font-medium">.env.example</Text> to{" "}
          <Text className="font-medium">.env</Text>, fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY and
          EXPO_PUBLIC_API_URL, then restart with <Text className="font-medium">npx expo start -c</Text>.
        </Text>
      </View>
    </View>
  );
}

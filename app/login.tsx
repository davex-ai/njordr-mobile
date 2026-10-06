import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { safeNext } from "@/lib/format";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string; error?: string }>();
  const next = safeNext(params.next) ?? "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [message, setMessage] = useState(params.error ? "Sign-in failed. Please try again." : "");

  // Deep link back into the app (njordr://auth/callback in builds, exp://... in Expo Go).
  // This exact URL must be in Supabase -> Auth -> URL Configuration -> Redirect URLs.
  const redirectTo = Linking.createURL("auth/callback", { queryParams: { next } });

  const done = () => router.replace(next);

  async function submit() {
    if (!email.trim() || password.length < 6) return setMessage("Enter your email and a password of at least 6 characters.");
    setBusy(true);
    setMessage("");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMessage(error.message);
      else done();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) setMessage(error.message);
      else if (data.session) done();
      else setMessage("Check your inbox to confirm your email, then sign in.");
    }
    setBusy(false);
  }

  async function google() {
    setGoogleBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error("Could not start Google sign-in");
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === "success") {
        const code = new URL(result.url).searchParams.get("code");
        if (!code) throw new Error("Google sign-in returned no code");
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) throw exErr;
        done();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 24 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-3xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</Text>
          <Text className="mt-1 text-muted">Sign in to save your cart and see your orders.</Text>
        </View>

        <Button label="Continue with Google" onPress={google} loading={googleBusy} />
        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-line" />
          <Text className="text-xs text-muted">or</Text>
          <View className="h-px flex-1 bg-line" />
        </View>

        <View className="gap-3">
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            accessibilityLabel="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
          />
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            accessibilityLabel="Password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onSubmitEditing={submit}
          />
          {!!message && <Text className="text-sm text-muted">{message}</Text>}
          <Button variant="primary" label={mode === "signin" ? "Sign in" : "Sign up"} onPress={submit} loading={busy} />
        </View>

        <View className="flex-row justify-center gap-1.5">
          <Text className="text-sm text-muted">{mode === "signin" ? "New here?" : "Already have an account?"}</Text>
          <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            <Text className="text-sm text-accent underline">{mode === "signin" ? "Create an account" : "Sign in"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

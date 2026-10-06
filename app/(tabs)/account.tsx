import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { AuthGate } from "@/components/ui/AuthGate";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { infoPages } from "@/lib/info";
import { safeNext } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

const EMPTY: Profile = { full_name: "", phone: "", address_line: "", city: "", state: "", country: "Nigeria" };

const FIELDS: { key: keyof Profile; label: string; autoComplete: "name" | "tel" | "street-address" | "postal-address-locality" | "postal-address-region" | "postal-address-country"; type?: "phone-pad" }[] = [
  { key: "full_name", label: "Full name", autoComplete: "name" },
  { key: "phone", label: "Phone number", autoComplete: "tel", type: "phone-pad" },
  { key: "address_line", label: "Street address", autoComplete: "street-address" },
  { key: "city", label: "City", autoComplete: "postal-address-locality" },
  { key: "state", label: "State", autoComplete: "postal-address-region" },
  { key: "country", label: "Country", autoComplete: "postal-address-country" },
];

export default function AccountScreen() {
  return (
    <AuthGate next="/account" message="Sign in to manage your delivery address.">
      <Account />
    </AuthGate>
  );
}

function Account() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = safeNext(params.next);

  const [form, setForm] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name, phone, address_line, city, state, country")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setForm((data as Profile | null) ?? EMPTY));
    }, [user]),
  );

  async function save() {
    if (!user || !form) return;
    const missing = FIELDS.some((f) => f.key !== "country" && !form[f.key].trim());
    if (missing) return setMessage("Please fill in all fields.");
    setBusy(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setBusy(false);
    if (error) setMessage(error.message);
    else if (next) {
      router.setParams({ next: "" });
      router.replace(next as never);
    } else setMessage("Saved.");
  }

  if (!form)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }} keyboardShouldPersistTaps="handled">
        <View>
          <Text className="text-3xl font-semibold tracking-tight">Delivery address</Text>
          <Text className="mt-1 text-muted">We use this to deliver your orders.</Text>
        </View>

        <View className="gap-4 rounded-2xl border border-line bg-surface p-5">
          <Text className="text-sm text-muted">Signed in as {user?.email}</Text>
          {FIELDS.map((f) => (
            <View key={f.key} className="gap-1.5">
              <Text className="text-sm text-muted">{f.label}</Text>
              <Input
                value={form[f.key]}
                onChangeText={(v) => setForm({ ...form, [f.key]: v })}
                autoComplete={f.autoComplete}
                keyboardType={f.type ?? "default"}
                autoCapitalize={f.key === "phone" ? "none" : "words"}
              />
            </View>
          ))}
          {!!message && <Text className="text-sm text-muted">{message}</Text>}
          <Button variant="primary" label={next ? "Save and continue" : "Save address"} onPress={save} loading={busy} className="self-start" />
        </View>

        <View className="overflow-hidden rounded-2xl border border-line bg-surface">
          {Object.entries(infoPages).map(([slug, p], i) => (
            <Pressable
              key={slug}
              onPress={() => router.push(`/info/${slug}`)}
              className={`flex-row items-center justify-between px-5 py-4 active:opacity-70 ${i > 0 ? "border-t border-line" : ""}`}>
              <Text className="text-sm">{p.title}</Text>
              <Text className="text-muted">›</Text>
            </Pressable>
          ))}
        </View>

        <Button label="Sign out" onPress={() => signOut()} />
        <Text className="text-center text-xs text-muted">© {new Date().getFullYear()} Njörðr. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { AuthGate } from "@/components/ui/AuthGate";
import { Button } from "@/components/ui/Button";
import { EmptyCard } from "@/components/ui/EmptyCard";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { API_URL } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { CartLine } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

type Address = { full_name: string; phone: string; address_line: string; city: string; state: string };

export default function CartScreen() {
  return (
    <AuthGate next="/cart" message="Sign in to save your cart and place orders.">
      <CartView />
    </AuthGate>
  );
}

function CartView() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { lines, total, setQty, reload } = useCart();
  const [address, setAddress] = useState<Address | null | undefined>(undefined);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // Re-read the address whenever the tab is focused, so edits made on the Account tab show up here.
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("full_name, phone, address_line, city, state")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => setAddress((data as Address | null) ?? null));
      reload();
    }, [user, reload]),
  );

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL isn't set, so checkout can't reach the web backend.");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      // The web app's /api/checkout accepts a Supabase access token as a Bearer header.
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Checkout failed");
      await reload();
      router.replace({ pathname: "/orders", params: { placed: body.orderId, email: body.emailSent ? "1" : "0" } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setPlacing(false);
    }
  }

  if (lines === null)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  if (lines.length === 0)
    return (
      <View className="flex-1 justify-center bg-background p-4">
        <EmptyCard
          title="Your cart is empty"
          hint="Find something you like in the shop."
          action={{ label: "Browse products", onPress: () => router.navigate("/shop") }}
        />
      </View>
    );

  const hasAddress = !!(address && address.full_name && address.phone && address.address_line && address.city && address.state);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 24 }}>
      <View className="overflow-hidden rounded-2xl border border-line bg-surface">
        {lines.map((l, i) => (
          <Line key={l.id} line={l} first={i === 0} onQty={(q) => setQty(l, q)} />
        ))}
      </View>

      <View className="rounded-2xl border border-line bg-surface p-5">
        <Text className="font-semibold">Order summary</Text>
        <View className="mt-4 flex-row justify-between">
          <Text className="text-sm text-muted">Subtotal</Text>
          <Text className="text-sm">{formatPrice(total)}</Text>
        </View>
        <View className="mt-2 flex-row justify-between border-t border-line pt-3">
          <Text className="font-semibold">Total</Text>
          <Text className="font-semibold">{formatPrice(total)}</Text>
        </View>

        <View className="mt-4 rounded-xl border border-line p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium">Deliver to</Text>
            <Pressable onPress={() => router.navigate({ pathname: "/account", params: { next: "/cart" } })}>
              <Text className="text-sm text-accent">{hasAddress ? "Change" : "Add address"}</Text>
            </Pressable>
          </View>
          {address === undefined ? (
            <Text className="mt-1 text-sm text-muted">Loading…</Text>
          ) : hasAddress ? (
            <Text className="mt-1 text-sm text-muted">
              {address!.full_name}, {address!.address_line}, {address!.city}, {address!.state}
              {"\n"}
              {address!.phone}
            </Text>
          ) : (
            <Text className="mt-1 text-sm text-muted">Add a delivery address to place your order.</Text>
          )}
        </View>

        {!!error && <Text className="mt-3 text-sm text-red-600">{error}</Text>}
        <Button
          variant="primary"
          label={placing ? "Placing order…" : "Place order"}
          className="mt-5"
          onPress={placeOrder}
          disabled={placing || !hasAddress}
          loading={placing}
        />
        <Text className="mt-3 text-xs text-muted">Demo checkout: no payment is taken.</Text>
      </View>
    </ScrollView>
  );
}

function Line({ line: l, first, onQty }: { line: CartLine; first: boolean; onQty: (q: number) => void }) {
  const router = useRouter();
  return (
    <View className={`flex-row items-center gap-4 p-4 ${first ? "" : "border-t border-line"}`}>
      <Pressable onPress={() => router.push(`/products/${l.products.id}`)} className="h-20 w-20 rounded-xl bg-background">
        <Image source={{ uri: l.products.image }} style={{ flex: 1, margin: 8 }} contentFit="contain" />
      </Pressable>
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="font-medium">
          {l.products.title}
        </Text>
        <Text className="text-sm text-muted">{formatPrice(l.products.price)}</Text>
        <View className="mt-2 flex-row items-center gap-2">
          <Pressable
            onPress={() => onQty(l.quantity - 1)}
            accessibilityLabel="Decrease quantity"
            className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface active:opacity-80">
            <Text>−</Text>
          </Pressable>
          <Text className="w-6 text-center text-sm">{l.quantity}</Text>
          <Pressable
            onPress={() => onQty(l.quantity + 1)}
            accessibilityLabel="Increase quantity"
            className="h-8 w-8 items-center justify-center rounded-full border border-line bg-surface active:opacity-80">
            <Text>+</Text>
          </Pressable>
          <Pressable onPress={() => onQty(0)} className="ml-3">
            <Text className="text-sm text-muted">Remove</Text>
          </Pressable>
        </View>
      </View>
      <Text className="font-semibold">{formatPrice(l.products.price * l.quantity)}</Text>
    </View>
  );
}

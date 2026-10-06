import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { AuthGate } from "@/components/ui/AuthGate";
import { EmptyCard } from "@/components/ui/EmptyCard";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { formatPrice, orderRef } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

export default function OrdersScreen() {
  return (
    <AuthGate next="/orders" message="Sign in to see your orders.">
      <Orders />
    </AuthGate>
  );
}

function Orders() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { placed, email } = useLocalSearchParams<{ placed?: string; email?: string }>();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, total, status, created_at, ship_name, ship_phone, ship_address, ship_city, ship_state, order_items(id, title, unit_price, quantity)")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Order[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Orders made on the web show up here too: refresh when the order changes server-side.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load]);

  if (orders === null)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.accent}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }>
      {!!placed && (
        <View className="rounded-2xl border border-line bg-surface p-4">
          <Text className="text-sm font-medium">Order #{orderRef(String(placed))} placed. Thank you!</Text>
          <Text className="text-sm text-muted">
            {email === "1" ? "A confirmation email is on its way." : "We couldn't send the confirmation email, but your order is saved."}
          </Text>
        </View>
      )}

      {orders.length === 0 ? (
        <EmptyCard title="No orders yet" action={{ label: "Start shopping", onPress: () => router.navigate("/shop") }} />
      ) : (
        orders.map((o) => (
          <View key={o.id} className="rounded-2xl border border-line bg-surface p-5">
            <View className="flex-row items-center justify-between gap-2">
              <View>
                <Text className="font-medium">#{orderRef(o.id)}</Text>
                <Text className="text-sm text-muted">{new Date(o.created_at).toLocaleString("en-NG")}</Text>
              </View>
              <View className="items-end">
                <Text className="font-semibold">{formatPrice(Number(o.total))}</Text>
                <Text className="text-xs uppercase tracking-wide text-accent">{o.status}</Text>
              </View>
            </View>
            {!!o.ship_address && (
              <Text className="mt-3 text-sm text-muted">
                Delivering to {o.ship_name}, {o.ship_address}, {o.ship_city}, {o.ship_state}
              </Text>
            )}
            <View className="mt-3 border-t border-line">
              {o.order_items.map((i, k) => (
                <View key={i.id} className={`flex-row justify-between gap-3 py-2 ${k > 0 ? "border-t border-line" : ""}`}>
                  <Text className="flex-1 text-sm">
                    {i.title} <Text className="text-sm text-muted">× {i.quantity}</Text>
                  </Text>
                  <Text className="text-sm">{formatPrice(Number(i.unit_price) * i.quantity)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

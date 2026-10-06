import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { ProductGrid } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { formatPrice, titleCase } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";

const SIMILAR = 4;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { add } = useCart();
  const [p, setP] = useState<Product | null | undefined>(undefined);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [state, setState] = useState<"idle" | "busy" | "added">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setP(undefined);
      const { data } = await supabase.from("products").select("*").eq("id", Number(id)).maybeSingle();
      if (cancelled) return;
      if (!data) return setP(null);
      const prod = data as Product;
      setP(prod);

      // Same category first, topped up with the best-rated others if the category is small.
      const { data: same } = await supabase
        .from("products")
        .select("*")
        .eq("category", prod.category)
        .neq("id", prod.id)
        .order("rating", { ascending: false })
        .limit(SIMILAR);
      let list = (same ?? []) as Product[];
      if (list.length < SIMILAR) {
        const { data: more } = await supabase
          .from("products")
          .select("*")
          .neq("category", prod.category)
          .order("rating", { ascending: false })
          .limit(SIMILAR - list.length);
        list = [...list, ...((more ?? []) as Product[])];
      }
      if (!cancelled) setSimilar(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function addToCart() {
    if (!p) return;
    if (!user) return router.push({ pathname: "/login", params: { next: `/products/${p.id}` } });
    setState("busy");
    setError("");
    const err = await add(p.id);
    if (err) {
      setError(err);
      setState("idle");
    } else {
      setState("added");
      setTimeout(() => setState("idle"), 1500);
    }
  }

  if (p === undefined)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  if (p === null)
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <Text className="text-lg font-medium">Product not found</Text>
        <Button label="Back to shop" onPress={() => router.navigate("/shop")} />
      </View>
    );

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 32, paddingBottom: 40 }}>
      <View className="aspect-square rounded-3xl border border-line bg-surface">
        <Image source={{ uri: p.image }} style={{ flex: 1, margin: 32 }} contentFit="contain" transition={200} accessibilityLabel={p.title} />
      </View>

      <View className="gap-4">
        <Pressable onPress={() => router.navigate({ pathname: "/shop", params: { category: p.category } })}>
          <Text className="text-sm uppercase tracking-wide text-accent">{titleCase(p.category)}</Text>
        </Pressable>
        <Text className="text-3xl font-semibold tracking-tight">{p.title}</Text>
        {!!p.brand && <Text className="text-muted">by {p.brand}</Text>}
        <Text className="text-2xl font-semibold">{formatPrice(p.price)}</Text>
        <Text className="text-sm text-muted">
          ★ {Number(p.rating).toFixed(1)} · {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
        </Text>
        <Text className="leading-6 text-muted">{p.description}</Text>
        <View className="pt-2">
          <Button
            variant="primary"
            label={p.stock < 1 ? "Out of stock" : state === "added" ? "Added to cart ✓" : "Add to cart"}
            disabled={p.stock < 1}
            loading={state === "busy"}
            onPress={addToCart}
          />
          {!!error && <Text className="mt-2 text-sm text-red-600">{error}</Text>}
        </View>
      </View>

      {similar.length > 0 && (
        <View className="border-t border-line pt-8">
          <View className="mb-4 flex-row items-end justify-between">
            <Text className="text-xl font-semibold">Similar products</Text>
            <Pressable onPress={() => router.navigate({ pathname: "/shop", params: { category: p.category } })}>
              <Text className="text-sm text-accent">More →</Text>
            </Pressable>
          </View>
          <ProductGrid products={similar} />
        </View>
      )}
    </ScrollView>
  );
}

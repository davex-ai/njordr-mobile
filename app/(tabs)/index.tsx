import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { CategorySlider, type CategoryCard } from "@/components/CategorySlider";
import { HeroMosaic } from "@/components/HeroMosaic";
import { ProductGrid } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { titleCase } from "@/lib/format";
import { getHeroImages, type HeroImage } from "@/lib/hero-images";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [hero, setHero] = useState<HeroImage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [{ data: top }, { data: all }, heroImages] = await Promise.all([
      supabase.from("products").select("*").order("rating", { ascending: false }).limit(8),
      supabase.from("products").select("category, image, rating"),
      getHeroImages(),
    ]);
    setFeatured((top ?? []) as Product[]);
    setHero(heroImages);

    // One card per category, pictured with its best-rated product.
    const byCategory = new Map<string, CategoryCard & { best: number }>();
    for (const p of all ?? []) {
      const cur = byCategory.get(p.category);
      const rating = Number(p.rating);
      if (!cur) byCategory.set(p.category, { slug: p.category, label: titleCase(p.category), image: p.image, count: 1, best: rating });
      else {
        cur.count++;
        if (rating > cur.best) Object.assign(cur, { image: p.image, best: rating });
      }
    }
    setCategories([...byCategory.values()].sort((a, b) => b.count - a.count));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingVertical: 16, gap: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>
      <View className="mx-4 overflow-hidden rounded-3xl border border-line bg-surface p-6">
        <Text className="text-sm uppercase tracking-[0.2em] text-muted">Trade, reimagined</Text>
        <Text className="mt-4 text-4xl font-semibold tracking-tight" style={{ lineHeight: 42 }}>
          Things worth having, <Text className="font-semibold text-accent">delivered.</Text>
        </Text>
        <Text className="mt-5 text-muted">
          Njörðr brings a curated range of beauty, home, fashion and everyday essentials to one clean, fast storefront.
        </Text>
        <View className="mt-8 flex-row flex-wrap gap-3">
          <Button variant="primary" label="Shop now" className="px-6 py-3" onPress={() => router.navigate("/shop")} />
        </View>
        <View className="mt-8">
          <HeroMosaic key={hero.length} images={hero} />
        </View>
      </View>

      {categories.length > 0 && <CategorySlider categories={categories} />}

      <View className="px-4">
        <View className="mb-4 flex-row items-end justify-between">
          <Text className="text-xl font-semibold">Top rated</Text>
          <Pressable onPress={() => router.navigate("/shop")}>
            <Text className="text-sm text-accent">View all →</Text>
          </Pressable>
        </View>
        {featured === null ? (
          <ActivityIndicator color={colors.accent} />
        ) : featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <Text className="text-muted">No products yet. Run the seed script in the web repo to load the catalog.</Text>
        )}
      </View>
    </ScrollView>
  );
}

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { formatPrice, titleCase } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ p }: { p: Product }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/products/${p.id}`)}
      className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80">
      <View className="aspect-square bg-background">
        <Image source={{ uri: p.image }} style={{ flex: 1, margin: 16 }} contentFit="contain" transition={150} accessibilityLabel={p.title} />
      </View>
      <View className="flex-1 gap-1 p-4">
        <Text className="text-xs uppercase tracking-wide text-muted">{titleCase(p.category)}</Text>
        <Text numberOfLines={2} className="text-sm font-medium">
          {p.title}
        </Text>
        <View className="mt-auto flex-row items-center justify-between pt-2">
          <Text className="font-semibold">{formatPrice(p.price)}</Text>
          <Text className="text-xs text-muted">★ {Number(p.rating).toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/** Two-column grid for use inside a ScrollView (the Shop screen uses FlatList instead). */
export function ProductGrid({ products }: { products: Product[] }) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return (
    <View className="gap-4">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-4">
          {row.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}

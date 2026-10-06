import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, ScrollView, View } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { titleCase } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 24;

export default function Shop() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = typeof params.category === "string" ? params.category : "";

  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  useEffect(() => {
    supabase
      .from("products")
      .select("category")
      .then(({ data }) => setCategories([...new Set((data ?? []).map((c) => c.category as string))].sort()));
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      const id = ++reqId.current;
      setLoading(true);
      let query = supabase.from("products").select("*", { count: "exact" }).order("id");
      if (q) query = query.ilike("title", `%${q.replace(/[%,]/g, "")}%`);
      if (category) query = query.eq("category", category);
      const from = (pageNum - 1) * PAGE_SIZE;
      const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
      if (id !== reqId.current) return; // a newer search superseded this one
      setItems((prev) => (replace ? ((data ?? []) as Product[]) : [...prev, ...((data ?? []) as Product[])]));
      setTotal(count ?? 0);
      setPage(pageNum);
      setLoading(false);
    },
    [q, category],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const loadMore = () => {
    if (!loading && items.length < total) fetchPage(page + 1, false);
  };

  const submit = () => {
    Keyboard.dismiss();
    setQ(input.trim());
  };
  const setCategory = (c: string) => router.setParams({ category: c });

  const header = (
    <View className="gap-4 pb-4">
      <Text className="text-3xl font-semibold tracking-tight">{category ? titleCase(category) : "All products"}</Text>
      <View className="flex-row gap-2">
        <Input
          value={input}
          onChangeText={setInput}
          onSubmitEditing={submit}
          returnKeyType="search"
          placeholder="Search products"
          accessibilityLabel="Search products"
          className="flex-1"
        />
        <Button variant="primary" label="Search" onPress={submit} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
        <Button label="All" variant={!category ? "primary" : "default"} onPress={() => setCategory("")} />
        {categories.map((c) => (
          <Button key={c} label={titleCase(c)} variant={category === c ? "primary" : "default"} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      className="flex-1 bg-background"
      data={items.length % 2 ? [...items, null] : items}
      keyExtractor={(p, i) => (p ? String(p.id) : `pad-${i}`)}
      numColumns={2}
      columnWrapperStyle={{ gap: 16 }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      renderItem={({ item }) => (item ? <ProductCard p={item} /> : <View className="flex-1" />)}
      onEndReached={loadMore}
      onEndReachedThreshold={0.6}
      ListEmptyComponent={
        loading ? null : (
          <Pressable onPress={() => setInput("")}>
            <Text className="text-muted">No products match your search.</Text>
          </Pressable>
        )
      }
      ListFooterComponent={loading ? <ActivityIndicator className="py-6" color={colors.accent} /> : null}
    />
  );
}

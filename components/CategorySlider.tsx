import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { FlatList, Pressable, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";

export type CategoryCard = { slug: string; label: string; image: string; count: number };

const TINTS = ["#e8eef2", "#efe9e1", "#e6efe9", "#efe6ea", "#eceaf3", "#f1eee0"];
const CARD_W = 224; // w-56
const GAP = 16;

export function CategorySlider({ categories }: { categories: CategoryCard[] }) {
  const router = useRouter();
  const list = useRef<FlatList<CategoryCard>>(null);
  const offset = useRef(0);

  const scroll = (dir: 1 | -1) => {
    const next = Math.max(0, offset.current + dir * (CARD_W + GAP) * 2);
    list.current?.scrollToOffset({ offset: next, animated: true });
  };

  return (
    <View>
      <View className="mb-4 flex-row items-end justify-between px-4">
        <Text className="text-xl font-semibold">Our categories</Text>
        <View className="flex-row gap-2">
          {(["←", "→"] as const).map((arrow, i) => (
            <Pressable
              key={arrow}
              onPress={() => scroll(i === 0 ? -1 : 1)}
              accessibilityLabel={i === 0 ? "Previous categories" : "Next categories"}
              className="h-9 w-9 items-center justify-center rounded-full border border-line bg-surface active:opacity-80">
              <Text className="text-base">{arrow}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        ref={list}
        horizontal
        data={categories}
        keyExtractor={(c) => c.slug}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: GAP }}
        onScroll={(e) => (offset.current = e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        renderItem={({ item: c, index: i }) => (
          <Animated.View entering={FadeInRight.delay(Math.min(i, 8) * 60).duration(400)}>
            <Pressable
              onPress={() => router.navigate({ pathname: "/shop", params: { category: c.slug } })}
              style={{ width: CARD_W, height: 288, backgroundColor: TINTS[i % TINTS.length] }}
              className="overflow-hidden rounded-2xl border border-line active:opacity-90">
              <Image
                source={{ uri: c.image }}
                style={{ position: "absolute", top: 24, left: 24, right: 24, bottom: 80 }}
                contentFit="contain"
                transition={150}
              />
              <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingTop: 48 }}>
                <Text className="font-semibold text-white">{c.label}</Text>
                <Text className="text-xs text-white/80">{c.count} products</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      />
    </View>
  );
}

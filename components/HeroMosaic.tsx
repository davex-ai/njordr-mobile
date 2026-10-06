import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/components/useTheme";
import type { HeroImage } from "@/lib/hero-images";

const SET_SIZE = 6; // multiple of 3 so the aspect pattern repeats exactly across the two copies
const COLUMNS = 3;
const GAP = 12;
const HEIGHT = 416; // h-[26rem]
const RATIOS = [3 / 4, 1, 4 / 5]; // width / height: aspect-[3/4], square, aspect-[4/5]

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomSet(pool: HeroImage[]): HeroImage[] {
  const s = shuffle(pool).slice(0, SET_SIZE);
  while (s.length < SET_SIZE) s.push(pool[s.length % pool.length]); // small pools: repeat
  return s;
}

function Column({ images, index, width }: { images: HeroImage[]; index: number; width: number }) {
  const reduce = useReducedMotion();
  const [set] = useState(() => randomSet(images));
  // Random direction + speed per column (the first column is always "up" and the last "down" so they never all match).
  const [{ up, seconds }] = useState(() => ({
    up: index === 0 ? true : index === COLUMNS - 1 ? false : Math.random() < 0.5,
    seconds: 30 + Math.random() * 25,
  }));

  const heights = useMemo(() => set.map((_, k) => width / RATIOS[(k + index) % RATIOS.length]), [set, index, width]);
  const half = heights.reduce((n, h) => n + h + GAP, 0);

  const y = useSharedValue(up ? 0 : -half);
  useEffect(() => {
    if (reduce || width <= 0) return;
    y.value = up ? 0 : -half;
    y.value = withRepeat(withTiming(up ? -half : 0, { duration: seconds * 1000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(y);
  }, [reduce, width, half, up, seconds, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  // Two identical copies end to end give a seamless endless loop.
  const items = [...set, ...set];

  return (
    <View style={{ width, height: HEIGHT, overflow: "hidden" }}>
      <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0 }, style]}>
        {items.map((img, k) => (
          <Image
            key={k}
            source={{ uri: img.src }}
            style={{ width, height: heights[k % SET_SIZE], marginBottom: GAP, borderRadius: 12 }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </Animated.View>
    </View>
  );
}

export function HeroMosaic({ images }: { images: HeroImage[] }) {
  const { colors } = useTheme();
  const [w, setW] = useState(0);
  const colW = w > 0 ? (w - GAP * (COLUMNS - 1)) / COLUMNS : 0;
  const fadeFrom = colors.surface;
  const fadeTo = `${colors.surface}00`;

  if (images.length === 0) return <View style={{ height: HEIGHT }} />;

  return (
    <Animated.View
      entering={FadeIn.duration(700)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ height: HEIGHT, borderRadius: 16, overflow: "hidden", flexDirection: "row", gap: GAP }}>
      {colW > 0 && Array.from({ length: COLUMNS }, (_, i) => <Column key={i} images={images} index={i} width={colW} />)}
      {/* Soft fade at the top and bottom edges, like the web mask-image. */}
      <LinearGradient pointerEvents="none" colors={[fadeFrom, fadeTo]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: HEIGHT * 0.14 }} />
      <LinearGradient pointerEvents="none" colors={[fadeTo, fadeFrom]} style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: HEIGHT * 0.14 }} />
    </Animated.View>
  );
}

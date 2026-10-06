import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <Image source={require("../assets/images/logo.png")} style={{ width: size * (125 / 91), height: size }} contentFit="contain" />
      <Text className="text-xl font-semibold tracking-tight text-accent">Njörðr</Text>
    </View>
  );
}

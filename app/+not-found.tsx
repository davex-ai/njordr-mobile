import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-xl font-semibold">This screen doesn't exist.</Text>
        <Link href="/" className="mt-4">
          <Text className="text-accent">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

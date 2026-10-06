import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { Text } from "@/components/ui/Text";
import { infoPages } from "@/lib/info";

export default function Info() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const page = infoPages[slug];
  if (!page) return <Text className="p-4 text-muted">Page not found.</Text>;
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{ title: page.title }} />
      <Text className="text-3xl font-semibold tracking-tight">{page.title}</Text>
      {page.body.map((p) => (
        <Text key={p} className="leading-6 text-muted">
          {p}
        </Text>
      ))}
    </ScrollView>
  );
}

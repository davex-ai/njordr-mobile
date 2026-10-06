import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

export function EmptyCard({ title, hint, action }: { title: string; hint?: string; action?: { label: string; onPress: () => void } }) {
  return (
    <View className="items-center rounded-2xl border border-line bg-surface p-10">
      <Text className="text-lg font-medium">{title}</Text>
      {hint && <Text className="mt-1 text-center text-muted">{hint}</Text>}
      {action && <Button variant="primary" label={action.label} onPress={action.onPress} className="mt-5" />}
    </View>
  );
}

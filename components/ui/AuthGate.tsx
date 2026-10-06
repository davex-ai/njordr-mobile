import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";
import { useAuth } from "@/providers/AuthProvider";

/** Cart / Orders / Account need a session (the web app redirects to /login?next=...). */
export function AuthGate({ next, message, children }: { next: string; message: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.accent} />
      </View>
    );

  if (!user)
    return (
      <View className="flex-1 justify-center bg-background p-4">
        <View className="items-center rounded-2xl border border-line bg-surface p-8">
          <Text className="text-lg font-medium">Sign in required</Text>
          <Text className="mt-1 text-center text-muted">{message}</Text>
          <Button
            variant="primary"
            label="Sign in"
            className="mt-5 px-8"
            onPress={() => router.push({ pathname: "/login", params: { next } })}
          />
        </View>
      </View>
    );

  return <>{children}</>;
}

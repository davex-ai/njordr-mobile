import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/useTheme";
import { useCart } from "@/providers/CartProvider";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const icon = (outline: IconName, filled: IconName) =>
  function TabIcon({ color, focused, size }: { color: string; focused: boolean; size: number }) {
    return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
  };

export default function TabLayout() {
  const { colors } = useTheme();
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: "Geist_500Medium", fontSize: 11 },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors["accent-fg"], fontFamily: "Geist_600SemiBold" },
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Geist_600SemiBold", fontSize: 18 },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: () => <Logo />,
          headerTitleAlign: "left",
          tabBarIcon: icon("home-outline", "home"),
        }}
      />
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: icon("storefront-outline", "storefront") }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          headerTitle: "Your cart",
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: icon("cart-outline", "cart"),
        }}
      />
      <Tabs.Screen name="orders" options={{ title: "Orders", headerTitle: "Your orders", tabBarIcon: icon("receipt-outline", "receipt") }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  );
}

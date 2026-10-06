import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: "primary" | "default";
  loading?: boolean;
  className?: string;
  textClassName?: string;
};

// The web app's pill `.btn` / `.btn-primary`.
export function Button({ label, variant = "default", loading, disabled, className, textClassName, ...rest }: Props) {
  const { colors } = useTheme();
  const primary = variant === "primary";
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={off}
      className={`flex-row items-center justify-center gap-2 rounded-full border px-[18px] py-[11px] active:opacity-80 ${
        primary ? "border-accent bg-accent" : "border-line bg-surface"
      } ${off ? "opacity-50" : ""} ${className ?? ""}`}
      {...rest}>
      {loading && <ActivityIndicator size="small" color={primary ? colors["accent-fg"] : colors.foreground} />}
      <Text className={`text-[14.5px] font-medium ${primary ? "text-accent-fg" : "text-foreground"} ${textClassName ?? ""}`}>
        {label}
      </Text>
    </Pressable>
  );
}

import type { TextInputProps } from "react-native";
import { TextInput } from "@/components/ui/Text";
import { useTheme } from "@/components/useTheme";

// The web app's `.input`.
export function Input({ className, ...props }: TextInputProps & { className?: string }) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      className={`w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[15px] text-foreground ${className ?? ""}`}
      {...props}
    />
  );
}

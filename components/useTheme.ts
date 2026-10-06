import { useColorScheme } from "react-native";
import { palette, type Scheme } from "@/constants/theme";

/** Hex colours for places Tailwind classes can't reach (navigation headers, icons, status bar...). */
export function useTheme() {
  const scheme: Scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colors: palette[scheme] };
}

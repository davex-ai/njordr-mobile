import { Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from "react-native";

// Geist ships one font file per weight, so map Tailwind's font-medium/semibold/bold onto the right family
// (and neutralise fontWeight so Android doesn't fake-bold on top of an already-bold file).
const FAMILY = {
  regular: "Geist_400Regular",
  medium: "Geist_500Medium",
  semibold: "Geist_600SemiBold",
  bold: "Geist_700Bold",
} as const;

function fontStyle(className?: string): TextStyle {
  const c = className ?? "";
  const family = /(^|\s)font-bold(\s|$)/.test(c)
    ? FAMILY.bold
    : /(^|\s)font-semibold(\s|$)/.test(c)
      ? FAMILY.semibold
      : /(^|\s)font-medium(\s|$)/.test(c)
        ? FAMILY.medium
        : FAMILY.regular;
  return { fontFamily: family, fontWeight: "normal" };
}

/** Default text colour comes from a class so a caller's `text-muted` etc. still wins (see `hasColor`). */
const hasColor = (c?: string) => /(^|\s)text-(foreground|muted|accent|accent-fg|white|red-\d+|black)(\s|\/|$)/.test(c ?? "");

export function Text({ className, style, ...props }: TextProps & { className?: string }) {
  return (
    <RNText
      {...props}
      className={`${hasColor(className) ? "" : "text-foreground"} ${className ?? ""}`}
      style={[fontStyle(className), style]}
    />
  );
}

export function TextInput({ className, style, ...props }: TextInputProps & { className?: string }) {
  return <RNTextInput {...props} className={className} style={[{ fontFamily: FAMILY.regular }, style]} />;
}

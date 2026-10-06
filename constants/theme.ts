// Same palette as the web app's globals.css (light + dark).
export const palette = {
  light: {
    background: "#f7f6f2",
    foreground: "#0e1116",
    surface: "#ffffff",
    muted: "#5d6672",
    line: "#e3e1da",
    accent: "#1b4965",
    "accent-fg": "#ffffff",
  },
  dark: {
    background: "#0a0d11",
    foreground: "#eceff3",
    surface: "#12161c",
    muted: "#9aa4b1",
    line: "#222932",
    accent: "#8ec1e4",
    "accent-fg": "#0a0d11",
  },
} as const;

export type Scheme = keyof typeof palette;
export type ThemeColors = (typeof palette)[Scheme];

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Hex palette -> `{ "--background": "247 246 242", ... }` for NativeWind's vars(). */
export const toCssVars = (colors: ThemeColors) =>
  Object.fromEntries(Object.entries(colors).map(([k, v]) => [`--${k}`, rgb(v)]));

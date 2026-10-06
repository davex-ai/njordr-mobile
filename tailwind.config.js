/** @type {import('tailwindcss').Config} */
// Colours are CSS variables (set from constants/theme.ts via NativeWind `vars`),
// so light/dark switch automatically with the system theme, same palette as the web app.
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: c("background"),
        foreground: c("foreground"),
        surface: c("surface"),
        muted: c("muted"),
        line: c("line"),
        accent: c("accent"),
        "accent-fg": c("accent-fg"),
      },
    },
  },
  plugins: [],
};

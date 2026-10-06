# Njörðr mobile

Expo (SDK 54) + Expo Router + NativeWind app for the Njörðr storefront. Same Supabase project and same
`/api/checkout` backend as the Next.js web app, so carts, addresses and orders sync across both.

## Setup
```bash
npm install
cp .env.example .env      # fill in the values
npx expo start -c
```

| Variable | What |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same as the web app's `NEXT_PUBLIC_*` values |
| `EXPO_PUBLIC_API_URL` | Deployed web app origin; checkout calls `POST {API_URL}/api/checkout` with the user's Supabase token |
| `EXPO_PUBLIC_USD_NGN` | Display-only exchange rate (default 1500) |
| `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` | Optional, hero photos (falls back to product photos) |

## Supabase dashboard (Auth -> URL Configuration -> Redirect URLs)
Add `njordr://auth/callback**` (builds) and, for Expo Go, the `exp://.../--/auth/callback` URL that
the login screen builds (log `Linking.createURL("auth/callback")` to see it). Google sign-in must also be enabled
in Supabase (same as the web app). Realtime must be enabled for `cart_items` (and `orders` for live order updates).

## Structure
```
app/(tabs)/   index (Home) · shop · cart · orders · account
app/products/[id].tsx · login.tsx · auth/callback.tsx · info/[slug].tsx
providers/    AuthProvider (session) · CartProvider (cart + realtime sync)
lib/          supabase client, types, format, hero-images, polyfills
components/   ProductCard, CategorySlider, HeroMosaic, ui/*
```

import { USD_NGN } from "@/lib/env";

// Prices are stored in USD (DummyJSON) and displayed in naira at a display-only rate.
// Hand-rolled instead of Intl so it renders identically on every Hermes/Android build.
export const formatPrice = (usd: number) => {
  const n = Math.round(usd * USD_NGN);
  return `₦${String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

export const titleCase = (slug: string) =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Same open-redirect guard the web app uses for `?next=`. */
export const safeNext = (next?: string | string[] | null) => {
  const v = Array.isArray(next) ? next[0] : next;
  return v && v.startsWith("/") && !v.startsWith("//") ? v : null;
};

export const orderRef = (id: string) => id.slice(0, 8).toUpperCase();

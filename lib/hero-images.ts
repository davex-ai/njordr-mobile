import { UNSPLASH_KEY } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export type HeroImage = { src: string; alt: string };

// Hero photos are limited to these themes (same as web).
const QUERIES = ["food", "jewelry", "clothes", "fashion accessories"];

// Product categories that match the same themes, used when no Unsplash key is set.
const FALLBACK_CATEGORIES = [
  "groceries",
  "womens-jewellery",
  "womens-dresses",
  "mens-shirts",
  "tops",
  "sunglasses",
  "womens-bags",
  "mens-watches",
  "womens-watches",
  "womens-shoes",
];

type UnsplashResult = { alt_description: string | null; urls: { small: string } };

let cache: { at: number; images: HeroImage[] } | null = null;
const DAY = 24 * 60 * 60 * 1000;

export async function getHeroImages(): Promise<HeroImage[]> {
  if (cache && Date.now() - cache.at < DAY) return cache.images;

  if (UNSPLASH_KEY) {
    try {
      const groups = await Promise.all(
        QUERIES.map(async (q) => {
          const res = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=portrait&content_filter=high`,
            { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
          );
          if (!res.ok) return [];
          const json = (await res.json()) as { results: UnsplashResult[] };
          return json.results.map((r) => ({ src: r.urls.small, alt: r.alt_description ?? q }));
        }),
      );
      const all = groups.flat();
      if (all.length >= 12) {
        cache = { at: Date.now(), images: all };
        return all;
      }
    } catch {
      // fall through to product photos
    }
  }

  const { data } = await supabase
    .from("products")
    .select("image, title")
    .in("category", FALLBACK_CATEGORIES)
    .limit(60);
  const images = (data ?? []).map((p) => ({ src: p.image as string, alt: p.title as string }));
  if (images.length) cache = { at: Date.now(), images };
  return images;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "@/lib/supabase";
import type { CartLine } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

type CartValue = {
  /** null while the first load is in flight. */
  lines: CartLine[] | null;
  count: number;
  total: number;
  reload: () => Promise<void>;
  add: (productId: number) => Promise<string | null>;
  setQty: (line: CartLine, qty: number) => Promise<void>;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [lines, setLines] = useState<CartLine[] | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setLines([]);
      return;
    }
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, quantity, products(id, title, price, image, stock)")
      .eq("user_id", userId)
      .order("created_at");
    if (!error) setLines((data ?? []) as unknown as CartLine[]);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLines([]);
      return;
    }
    setLines(null);
    // Live sync: changes made on another device (web or mobile) appear here immediately.
    // Reload on (re)subscribe so nothing is missed between the first fetch and the subscription.
    const channel = supabase
      .channel(`cart-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items" }, () => reload())
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") reload();
      });
    reload();
    const appState = AppState.addEventListener("change", (s) => s === "active" && reload());
    return () => {
      appState.remove();
      supabase.removeChannel(channel);
    };
  }, [userId, reload]);

  const add = useCallback(
    async (productId: number) => {
      if (!userId) return "Not signed in";
      const { data: existing } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();
      const { error } = await supabase.from("cart_items").upsert(
        { user_id: userId, product_id: productId, quantity: Math.min((existing?.quantity ?? 0) + 1, 99) },
        { onConflict: "user_id,product_id" },
      );
      if (!error) await reload();
      return error?.message ?? null;
    },
    [userId, reload],
  );

  const setQty = useCallback(
    async (line: CartLine, qty: number) => {
      if (qty < 1) await supabase.from("cart_items").delete().eq("id", line.id);
      else await supabase.from("cart_items").update({ quantity: Math.min(qty, 99) }).eq("id", line.id);
      await reload();
    },
    [reload],
  );

  const value = useMemo<CartValue>(() => {
    const l = lines ?? [];
    return {
      lines,
      count: l.reduce((n, x) => n + x.quantity, 0),
      total: l.reduce((n, x) => n + x.products.price * x.quantity, 0),
      reload,
      add,
      setQty,
    };
  }, [lines, reload, add, setQty]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

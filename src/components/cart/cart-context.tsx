"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type CartItem = {
  productoId: string;
  slug: string;
  nombre: string;
  marcaNombre: string;
  precioUnitario: number;
  cantidad: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "cantidad">, cantidad: number) => void;
  updateCantidad: (productoId: string, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nava:cart";
const UPDATE_EVENT = "nava:cart-updated";

let cachedRaw: string | null | undefined;
let cachedSnapshot: CartItem[] = [];

function getSnapshot(): CartItem[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    cachedSnapshot = [];
  }
  return cachedSnapshot;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function subscribe(callback: () => void) {
  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function writeItems(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // almacenamiento lleno o bloqueado: el cambio no persiste pero la UI sigue reaccionando
  }
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<CartItem, "cantidad">, cantidad: number) => {
    const current = getSnapshot();
    const existente = current.find((i) => i.productoId === item.productoId);
    const next = existente
      ? current.map((i) =>
          i.productoId === item.productoId
            ? { ...i, cantidad: Math.min(i.stock, i.cantidad + cantidad) }
            : i,
        )
      : [...current, { ...item, cantidad: Math.min(item.stock, cantidad) }];
    writeItems(next);
  }, []);

  const updateCantidad = useCallback((productoId: string, cantidad: number) => {
    const next = getSnapshot()
      .map((i) =>
        i.productoId === productoId ? { ...i, cantidad: Math.max(1, Math.min(i.stock, cantidad)) } : i,
      )
      .filter((i) => i.cantidad > 0);
    writeItems(next);
  }, []);

  const removeItem = useCallback((productoId: string) => {
    writeItems(getSnapshot().filter((i) => i.productoId !== productoId));
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
    const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
    return { items, totalItems, subtotal, addItem, updateCantidad, removeItem, clear };
  }, [items, addItem, updateCantidad, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

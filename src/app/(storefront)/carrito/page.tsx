import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Tu carrito — Nava",
};

export default function CarritoPage() {
  return <CartView />;
}

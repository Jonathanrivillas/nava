import type { Metadata } from "next";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = {
  title: "Finalizar compra — Nava",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}

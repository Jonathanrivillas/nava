import type { Metadata } from "next";
import { auth } from "@/auth";
import { CheckoutView } from "./checkout-view";

export const metadata: Metadata = {
  title: "Finalizar compra — Nava",
};

export default async function CheckoutPage() {
  const session = await auth();
  const usuario = session?.user
    ? { nombre: session.user.name ?? "", email: session.user.email ?? null }
    : null;

  return <CheckoutView usuario={usuario} />;
}

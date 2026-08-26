import type { Metadata } from "next";
import { RegistroView } from "./registro-view";

export const metadata: Metadata = {
  title: "Crear cuenta — Nava",
};

export default function RegistroPage() {
  return <RegistroView />;
}

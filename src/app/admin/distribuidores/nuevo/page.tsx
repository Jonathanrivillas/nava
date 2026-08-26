import type { Metadata } from "next";
import { DistribuidorForm } from "@/components/admin/distribuidor-form";

export const metadata: Metadata = {
  title: "Nuevo distribuidor — Admin Nava",
};

export default function NuevoDistribuidorPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Nuevo distribuidor</h1>
      <DistribuidorForm />
    </div>
  );
}

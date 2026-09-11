import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { serializarProducto } from "@/lib/serialize";
import { OfertaForm } from "@/components/admin/oferta-form";

export const metadata: Metadata = {
  title: "Nueva oferta — Admin Nava",
};

export default async function NuevaOfertaPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Nueva oferta</h1>
      <OfertaForm productos={productos.map(serializarProducto)} />
    </div>
  );
}

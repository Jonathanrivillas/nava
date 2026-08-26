import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializarOferta, serializarProducto } from "@/lib/serialize";
import { OfertaForm } from "@/components/admin/oferta-form";

export const metadata: Metadata = {
  title: "Editar oferta — Admin Nava",
};

export default async function EditarOfertaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [oferta, productos] = await Promise.all([
    prisma.oferta.findUnique({ where: { id } }),
    prisma.producto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  if (!oferta) notFound();

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Editar oferta</h1>
      <OfertaForm oferta={serializarOferta(oferta)} productos={productos.map(serializarProducto)} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFormOptions } from "@/app/admin/productos/actions";
import { ProductoForm } from "@/components/admin/producto-form";

export const metadata: Metadata = {
  title: "Editar producto — Admin Nava",
};

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, { marcas, categorias, distribuidores }] = await Promise.all([
    prisma.producto.findUnique({ where: { id } }),
    getFormOptions(),
  ]);

  if (!producto) notFound();

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Editar producto</h1>
      <ProductoForm
        producto={producto}
        marcas={marcas}
        categorias={categorias}
        distribuidores={distribuidores}
      />
    </div>
  );
}

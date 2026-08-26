import type { Metadata } from "next";
import { getFormOptions } from "@/app/admin/productos/actions";
import { ProductoForm } from "@/components/admin/producto-form";

export const metadata: Metadata = {
  title: "Nuevo producto — Admin Nava",
};

export default async function NuevoProductoPage() {
  const { marcas, categorias, distribuidores } = await getFormOptions();

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Nuevo producto</h1>
      <ProductoForm marcas={marcas} categorias={categorias} distribuidores={distribuidores} />
    </div>
  );
}

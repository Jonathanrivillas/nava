import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrecio } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ToggleActivo } from "@/components/admin/toggle-activo";
import { PlusIcon, ImagePlaceholderIcon, EditIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Productos — Admin Nava",
};

export default async function AdminProductosPage() {
  const productos = await prisma.producto.findMany({
    include: { marca: true, categoria: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button className="gap-2">
            <PlusIcon width={14} height={14} />
            Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3"></th>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3">Marca</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Precio</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {p.imagenPrincipal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imagenPrincipal} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlaceholderIcon width={16} height={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold">{p.nombre}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.marca.nombre}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.categoria.nombre}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        p.tipo === "PROPIO"
                          ? "border border-border bg-muted text-foreground/70"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {p.tipo === "PROPIO" ? "Propio" : "Dropshipping"}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold">{formatPrecio(p.precioVenta)}</td>
                  <td className="px-3 py-3">{p.stock}</td>
                  <td className="px-3 py-3">
                    <ToggleActivo id={p.id} activo={p.activo} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link
                      href={`/admin/productos/${p.id}/editar`}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <EditIcon width={15} height={15} />
                    </Link>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                    Aún no hay productos. Crea el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PlusIcon, EditIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Distribuidores — Admin Nava",
};

export default async function AdminDistribuidoresPage() {
  const distribuidores = await prisma.distribuidor.findMany({
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Distribuidores</h1>
          <Link href="/admin/inventario" className="text-sm font-semibold text-primary">
            Ver inventario
          </Link>
        </div>
        <Link href="/admin/distribuidores/nuevo">
          <Button className="gap-2">
            <PlusIcon width={14} height={14} />
            Nuevo distribuidor
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Nombre</th>
              <th className="px-3 py-3">Contacto</th>
              <th className="px-3 py-3">Dirección</th>
              <th className="px-3 py-3">Productos</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {distribuidores.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium">{d.nombre}</td>
                <td className="px-3 py-3 text-muted-foreground">{d.contacto || "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{d.direccion || "—"}</td>
                <td className="px-3 py-3">{d._count.productos}</td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/admin/distribuidores/${d.id}/editar`}
                    className="inline-flex text-muted-foreground hover:text-foreground"
                  >
                    <EditIcon width={15} height={15} />
                  </Link>
                </td>
              </tr>
            ))}
            {distribuidores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  No hay distribuidores todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

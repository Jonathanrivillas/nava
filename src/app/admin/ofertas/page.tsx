import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrecio } from "@/lib/format";
import { getEstadoOferta, ESTADO_OFERTA_LABEL, ESTADO_OFERTA_BADGE_CLASS } from "@/lib/ofertas-admin";
import { Button } from "@/components/ui/button";
import { EliminarOfertaButton } from "@/components/admin/eliminar-oferta-button";
import { PlusIcon, EditIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Precios y ofertas — Admin Nava",
};

export default async function AdminOfertasPage() {
  const ofertas = await prisma.oferta.findMany({
    include: { producto: true },
    orderBy: { fechaInicio: "desc" },
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Precios y ofertas</h1>
        <Link href="/admin/ofertas/nueva">
          <Button className="gap-2">
            <PlusIcon width={14} height={14} />
            Nueva oferta
          </Button>
        </Link>
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Los precios base de cada producto se editan desde{" "}
        <Link href="/admin/productos" className="font-semibold text-primary">
          Productos
        </Link>
        . Aquí se programan descuentos temporales (ofertas) sobre esos precios.
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Producto</th>
                <th className="px-3 py-3">Descuento</th>
                <th className="px-3 py-3">Desde</th>
                <th className="px-3 py-3">Hasta</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ofertas.map((o) => {
                const estado = getEstadoOferta(o.fechaInicio, o.fechaFin);
                return (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium">{o.producto.nombre}</td>
                    <td className="px-3 py-3">
                      {o.tipo === "PORCENTAJE" ? `-${Number(o.valor)}%` : `-${formatPrecio(o.valor)}`}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {o.fechaInicio.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {o.fechaFin.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ESTADO_OFERTA_BADGE_CLASS[estado]}`}>
                        {ESTADO_OFERTA_LABEL[estado]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/ofertas/${o.id}/editar`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <EditIcon width={15} height={15} />
                        </Link>
                        <EliminarOfertaButton id={o.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {ofertas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No hay ofertas programadas todavía.
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

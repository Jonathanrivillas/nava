import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getInventarioOptions } from "@/app/admin/inventario/actions";
import { MovimientoForm } from "@/components/admin/movimiento-form";
import { CompraDistribuidorForm } from "@/components/admin/compra-distribuidor-form";

export const metadata: Metadata = {
  title: "Inventario — Admin Nava",
};

const STOCK_BAJO_UMBRAL = 5;

export default async function AdminInventarioPage() {
  const [{ productos, distribuidores }, movimientos] = await Promise.all([
    getInventarioOptions(),
    prisma.movimientoInventario.findMany({
      include: { producto: true },
      orderBy: { fecha: "desc" },
      take: 20,
    }),
  ]);

  const productosStockBajo = productos.filter((p) => p.activo && p.stock < STOCK_BAJO_UMBRAL);

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Inventario</h1>
        <Link href="/admin/distribuidores" className="text-sm font-semibold text-primary">
          Ver distribuidores
        </Link>
      </div>

      {productosStockBajo.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-warning bg-warning/10 p-5">
          <div className="text-sm font-semibold text-warning-foreground">
            {productosStockBajo.length} producto{productosStockBajo.length > 1 ? "s" : ""} con stock bajo
            (menos de {STOCK_BAJO_UMBRAL} unidades)
          </div>
          <div className="flex flex-wrap gap-2">
            {productosStockBajo.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-card px-3 py-1 text-xs font-medium text-foreground"
              >
                {p.nombre} — {p.stock}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MovimientoForm productos={productos} />
        <CompraDistribuidorForm productos={productos} distribuidores={distribuidores} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Movimientos recientes</h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Producto</th>
                <th className="px-3 py-3">Tipo</th>
                <th className="px-3 py-3">Cantidad</th>
                <th className="px-3 py-3">Motivo</th>
                <th className="px-3 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{m.producto.nombre}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        m.tipo === "ENTRADA"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-white"
                      }`}
                    >
                      {m.tipo === "ENTRADA" ? "Entrada" : "Salida"}
                    </span>
                  </td>
                  <td className="px-3 py-3">{m.cantidad}</td>
                  <td className="px-3 py-3 text-muted-foreground">{m.motivo}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {m.fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    No hay movimientos registrados todavía.
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

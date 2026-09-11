import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { formatPrecio } from "@/lib/format";
import { ESTADOS, type Estado, ESTADO_LABEL, METODO_PAGO_LABEL } from "@/lib/pedidos";
import { EstadoPedidoSelect } from "@/components/admin/estado-pedido-select";

export const metadata: Metadata = {
  title: "Pedidos — Admin Nava",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const estadoValido =
    estado && (ESTADOS as readonly string[]).includes(estado) ? (estado as Estado) : undefined;
  const where: Prisma.PedidoWhereInput = estadoValido ? { estado: estadoValido } : {};

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { fecha: "desc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Pedidos</h1>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            !estado ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
          }`}
        >
          Todos
        </Link>
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={`/admin/pedidos?estado=${e}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              estado === e ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
            }`}
          >
            {ESTADO_LABEL[e]}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Pedido</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Ítems</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Pago</th>
                <th className="px-3 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/admin/pedidos/${p.id}`} className="font-mono text-xs font-semibold text-primary">
                      {p.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {p.fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{p.nombreContacto}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.esInvitado ? "Invitado" : "Cliente registrado"} · {p.telefonoContacto}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {p.items.reduce((a, i) => a + i.cantidad, 0)}
                  </td>
                  <td className="px-3 py-3 font-semibold">{formatPrecio(p.total)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{METODO_PAGO_LABEL[p.metodoPago]}</td>
                  <td className="px-3 py-3">
                    <EstadoPedidoSelect id={p.id} estado={p.estado} />
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                    No hay pedidos {estado ? `en estado "${ESTADO_LABEL[estado]}"` : "todavía"}.
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

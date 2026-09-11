import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrecio } from "@/lib/format";
import { METODO_PAGO_LABEL } from "@/lib/pedidos";
import { EstadoPedidoSelect } from "@/components/admin/estado-pedido-select";
import { ChevronRightIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Detalle de pedido — Admin Nava",
};

export default async function AdminPedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { items: { include: { producto: true } } },
  });

  if (!pedido) notFound();

  return (
    <div className="flex flex-col gap-6 p-8">
      <Link href="/admin/pedidos" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ChevronRightIcon width={14} height={14} className="rotate-180" />
        Volver a pedidos
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Pedido</h1>
          <div className="font-mono text-xs text-muted-foreground">{pedido.id}</div>
        </div>
        <EstadoPedidoSelect id={pedido.id} estado={pedido.estado} />
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl border border-border p-5">
          <div className="text-xs font-semibold text-muted-foreground">Cliente</div>
          <div className="font-medium">{pedido.nombreContacto}</div>
          <div className="text-sm text-muted-foreground">{pedido.telefonoContacto}</div>
          {pedido.emailContacto && <div className="text-sm text-muted-foreground">{pedido.emailContacto}</div>}
          <div className="mt-1 text-xs text-muted-foreground">
            {pedido.esInvitado ? "Compra como invitado" : "Cliente registrado"}
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border p-5">
          <div className="text-xs font-semibold text-muted-foreground">Envío</div>
          <div className="text-sm">{pedido.direccionEnvio}</div>
          <div className="mt-2 text-xs font-semibold text-muted-foreground">Método de pago</div>
          <div className="text-sm">{METODO_PAGO_LABEL[pedido.metodoPago]}</div>
        </div>
      </div>

      <div className="max-w-3xl overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Producto</th>
              <th className="px-3 py-3">Cantidad</th>
              <th className="px-3 py-3">Precio unitario</th>
              <th className="px-3 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium">{item.producto.nombre}</td>
                <td className="px-3 py-3">{item.cantidad}</td>
                <td className="px-3 py-3">{formatPrecio(item.precioUnitario)}</td>
                <td className="px-3 py-3 text-right font-semibold">
                  {formatPrecio(Number(item.precioUnitario) * item.cantidad)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-1.5 border-t border-border p-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrecio(pedido.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Envío</span>
            <span>{formatPrecio(pedido.costoEnvio)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrecio(pedido.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

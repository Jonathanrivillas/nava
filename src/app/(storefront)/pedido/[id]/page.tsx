import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrecio } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Pedido confirmado — Nava",
};

const METODO_PAGO_LABEL: Record<string, string> = {
  CONTRA_ENTREGA: "Pago contra entrega",
  TRANSFERENCIA: "Transferencia bancaria",
  PASARELA_ONLINE: "Pasarela en línea",
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default async function PedidoConfirmacionPage({
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
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <CheckCircleIcon width={40} height={40} className="text-success" />
        <h1 className="font-display text-3xl">¡Pedido confirmado!</h1>
        <p className="text-muted-foreground">
          Te contactaremos por WhatsApp al {pedido.telefonoContacto} para confirmar la entrega.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-7">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Pedido</div>
            <div className="font-mono text-sm font-semibold">{pedido.id}</div>
          </div>
          <span className="rounded-full bg-warning px-3 py-1 text-xs font-semibold text-warning-foreground">
            {ESTADO_LABEL[pedido.estado]}
          </span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-3">
          {pedido.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                {item.producto.nombre} <span className="text-muted-foreground">× {item.cantidad}</span>
              </div>
              <div className="font-semibold">
                {formatPrecio(Number(item.precioUnitario) * item.cantidad)}
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-foreground/80">
            <span>Subtotal</span>
            <span>{formatPrecio(pedido.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-foreground/80">
            <span>Envío</span>
            <span>Por confirmar</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrecio(pedido.total)}</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Contacto</div>
            <div>{pedido.nombreContacto}</div>
            <div className="text-muted-foreground">{pedido.telefonoContacto}</div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Envío a</div>
            <div>{pedido.direccionEnvio}</div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Método de pago</div>
            <div>{METODO_PAGO_LABEL[pedido.metodoPago]}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link href="/catalogo">
          <Button variant="outline">Seguir comprando</Button>
        </Link>
      </div>
    </div>
  );
}

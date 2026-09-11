import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrecio } from "@/lib/format";
import { ESTADO_LABEL, ESTADO_BADGE_CLASS } from "@/lib/pedidos";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mis pedidos — Nava",
};

export default async function MisPedidosPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/mis-pedidos");
  }

  const pedidos = await prisma.pedido.findMany({
    where: { userId: session.user.id },
    orderBy: { fecha: "desc" },
    include: { items: true },
  });

  if (pedidos.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
        <h1 className="mb-3 font-display text-3xl">Aún no tienes pedidos</h1>
        <p className="mb-6 text-muted-foreground">Cuando compres algo, lo vas a ver reflejado aquí.</p>
        <Link href="/catalogo">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <h1 className="mb-8 font-display text-4xl">Mis pedidos</h1>

      <div className="flex flex-col gap-4">
        {pedidos.map((p) => (
          <Link
            key={p.id}
            href={`/pedido/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-border p-5 hover:border-primary"
          >
            <div>
              <div className="font-mono text-xs text-muted-foreground">{p.id.slice(-8)}</div>
              <div className="text-sm text-muted-foreground">
                {p.fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })} ·{" "}
                {p.items.reduce((a, i) => a + i.cantidad, 0)} producto(s)
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{formatPrecio(p.total)}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE_CLASS[p.estado]}`}>
                {ESTADO_LABEL[p.estado]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

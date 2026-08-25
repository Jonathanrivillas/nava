import Link from "next/link";
import type { Marca, Oferta, Producto } from "@/generated/prisma/client";
import { formatPrecio } from "@/lib/format";
import { calcularPrecioFinal, getOfertaActiva } from "@/lib/ofertas";
import { ImagePlaceholderIcon } from "@/components/storefront/icons";

type ProductoConRelaciones = Producto & { marca: Marca; ofertas: Oferta[] };

const GRADIENTES = [
  "from-[oklch(94%_0.03_40)] to-[oklch(90%_0.04_30)]",
  "from-[oklch(93%_0.03_60)] to-[oklch(88%_0.04_50)]",
  "from-[oklch(92%_0.05_20)] to-[oklch(87%_0.06_15)]",
];

function gradienteFor(id: string) {
  const index = id.charCodeAt(0) % GRADIENTES.length;
  return GRADIENTES[index];
}

export function ProductCard({ producto }: { producto: ProductoConRelaciones }) {
  const oferta = getOfertaActiva(producto.ofertas);
  const precioFinal = calcularPrecioFinal(producto.precioVenta, oferta);
  const agotado = producto.stock <= 0;

  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      <div
        className={`relative flex h-48 items-center justify-center rounded-lg bg-gradient-to-br text-[oklch(65%_0.04_35)] ${gradienteFor(producto.id)}`}
      >
        <ImagePlaceholderIcon width={30} height={30} />
        {oferta && (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[11px] font-bold text-white">
            {oferta.tipo === "PORCENTAJE" ? `-${Number(oferta.valor)}%` : "Oferta"}
          </span>
        )}
        {agotado && (
          <span className="absolute inset-x-2 bottom-2 rounded-md bg-foreground/80 px-2 py-1.5 text-center text-[11px] font-bold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        {producto.marca.nombre}
      </div>
      <div className="text-[15px] font-semibold leading-tight text-foreground">
        {producto.nombre}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-bold text-foreground">{formatPrecio(precioFinal)}</span>
        {oferta && (
          <span className="text-[13px] text-muted-foreground line-through">
            {formatPrecio(producto.precioVenta)}
          </span>
        )}
      </div>
    </Link>
  );
}

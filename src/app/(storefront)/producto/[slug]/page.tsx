import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductoPorSlug, getProductosRelacionados } from "@/lib/products";
import { calcularPrecioFinal, getOfertaActiva } from "@/lib/ofertas";
import { formatPrecio } from "@/lib/format";
import { ProductCard } from "@/components/storefront/product-card";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { CheckCircleIcon, ImagePlaceholderIcon, TruckIcon } from "@/components/storefront/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) return {};
  return { title: `${producto.nombre} — Nava` };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) notFound();

  const oferta = getOfertaActiva(producto.ofertas);
  const precioFinal = calcularPrecioFinal(producto.precioVenta, oferta);
  const agotado = producto.stock <= 0;
  const relacionados = await getProductosRelacionados(producto.categoriaId, producto.id);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/">Inicio</Link> / <Link href="/catalogo">Catálogo</Link> / {producto.categoria.nombre} /{" "}
        <span className="font-semibold text-foreground">{producto.nombre}</span>
      </div>

      <div className="flex flex-col gap-14 lg:flex-row">
        <div className="w-full lg:w-[440px] lg:shrink-0">
          <div className="flex h-[440px] items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(94%_0.03_40)] to-[oklch(88%_0.05_30)] text-[oklch(65%_0.04_35)]">
            <ImagePlaceholderIcon width={48} height={48} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-5 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            {producto.marca.nombre}
          </div>
          <h1 className="font-display text-4xl leading-tight">{producto.nombre}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrecio(precioFinal)}</span>
            {oferta && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrecio(producto.precioVenta)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {agotado ? (
              <span className="text-sm font-semibold text-destructive">Agotado</span>
            ) : (
              <>
                <CheckCircleIcon width={16} height={16} className="text-success" />
                <span className="text-sm font-semibold text-success">
                  En stock — {producto.stock} disponibles
                </span>
              </>
            )}
          </div>

          {producto.descripcion && (
            <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              {producto.descripcion}
            </p>
          )}

          <div className="my-2 h-px bg-border" />

          <AddToCart
            producto={{
              id: producto.id,
              slug: producto.slug,
              nombre: producto.nombre,
              marcaNombre: producto.marca.nombre,
              precioUnitario: precioFinal,
              stock: producto.stock,
            }}
          />

          <div className="mt-2 flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
            <TruckIcon width={18} height={18} className="text-primary" />
            <span className="text-[13px]">Envío a todo el país</span>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <div className="mt-20 flex flex-col gap-7">
          <h2 className="font-display text-3xl">También te puede interesar</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relacionados.map((r) => (
              <ProductCard key={r.id} producto={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

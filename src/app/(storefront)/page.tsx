import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBannersActivos } from "@/lib/banners";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { TruckIcon, CheckCircleIcon, WhatsappIcon, ImagePlaceholderIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Nava — Maquillaje de marcas reconocidas",
};

const WHATSAPP_URL = "https://wa.me/573106490790";

export default async function HomePage() {
  const [banners, categorias, productosDestacados] = await Promise.all([
    getBannersActivos(),
    prisma.categoria.findMany({ where: { categoriaPadreId: { not: null } }, orderBy: { nombre: "asc" } }),
    prisma.producto.findMany({
      where: { activo: true },
      include: { marca: true, ofertas: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const heroBanner = banners[0];

  return (
    <div>
      {/* HERO */}
      {heroBanner ? (
        <div className="mx-6 mt-8 overflow-hidden rounded-2xl lg:mx-10">
          <Link href={heroBanner.link || "/catalogo"} className="block">
            <div className="relative flex h-[360px] items-end bg-muted lg:h-[440px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroBanner.imagenUrl} alt={heroBanner.texto ?? ""} className="absolute inset-0 h-full w-full object-cover" />
              {heroBanner.texto && (
                <div className="relative z-10 bg-gradient-to-t from-black/60 to-transparent p-8 text-2xl font-semibold text-white lg:text-3xl">
                  {heroBanner.texto}
                </div>
              )}
            </div>
          </Link>
        </div>
      ) : (
        <div className="mx-6 mt-8 flex h-[360px] flex-col items-start justify-center gap-5 rounded-2xl bg-gradient-to-br from-[oklch(88%_0.05_35)] to-[oklch(80%_0.07_25)] px-10 lg:mx-10 lg:h-[440px]">
          <div className="text-xs font-bold uppercase tracking-wider text-[oklch(30%_0.08_30)]">
            Nava
          </div>
          <h1 className="max-w-md font-display text-5xl leading-tight text-[oklch(20%_0.03_30)]">
            Belleza que se nota
          </h1>
          <p className="max-w-sm text-[oklch(30%_0.04_30)]">
            Marcas reconocidas, precios competitivos y envíos a todo el país.
          </p>
          <Link href="/catalogo">
            <Button className="h-12 px-7">Ver catálogo</Button>
          </Link>
        </div>
      )}

      {/* CATEGORIAS */}
      {categorias.length > 0 && (
        <div className="px-6 pt-16 lg:px-10">
          <h2 className="mb-7 font-display text-3xl">Compra por categoría</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/catalogo?categoria=${c.id}`}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-secondary text-primary">
                  <ImagePlaceholderIcon width={26} height={26} />
                </div>
                <div className="text-sm font-semibold">{c.nombre}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* DESTACADOS */}
      {productosDestacados.length > 0 && (
        <div className="px-6 pt-16 lg:px-10">
          <div className="mb-7 flex items-baseline justify-between">
            <h2 className="font-display text-3xl">Recién llegados</h2>
            <Link href="/catalogo" className="text-sm font-semibold text-primary">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {productosDestacados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      )}

      {/* TRUST STRIP */}
      <div className="mx-6 mt-16 mb-8 grid grid-cols-1 gap-6 rounded-2xl bg-muted px-8 py-8 sm:grid-cols-3 lg:mx-10">
        <div className="flex items-center gap-3.5">
          <TruckIcon width={20} height={20} className="text-primary" />
          <span className="text-sm font-medium">Envíos a todo el país</span>
        </div>
        <div className="flex items-center gap-3.5">
          <CheckCircleIcon width={20} height={20} className="text-primary" />
          <span className="text-sm font-medium">Pago contra entrega o en línea</span>
        </div>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5">
          <WhatsappIcon width={20} height={20} className="text-primary" />
          <span className="text-sm font-medium">Atención directa por WhatsApp</span>
        </a>
      </div>

      {/* FLOATING WHATSAPP */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-8 right-8 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(50%_0.1_150)] text-white shadow-lg"
      >
        <WhatsappIcon width={26} height={26} />
      </a>
    </div>
  );
}

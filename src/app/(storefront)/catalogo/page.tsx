import type { Metadata } from "next";
import Link from "next/link";
import { getFiltrosDisponibles, getProductosCatalogo, type CatalogoSort } from "@/lib/products";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogoFiltros } from "@/components/storefront/catalogo-filtros";
import { CatalogoOrden } from "@/components/storefront/catalogo-orden";
import { CatalogoPagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "Catálogo — Nava",
};

type SearchParams = Record<string, string | undefined>;

function parseIds(value: string | undefined) {
  return value?.split(",").filter(Boolean);
}

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const filtros = {
    q: params.q,
    marcaIds: parseIds(params.marca),
    categoriaIds: parseIds(params.categoria),
    precioMin: params.precioMin ? Number(params.precioMin) : undefined,
    precioMax: params.precioMax ? Number(params.precioMax) : undefined,
    soloDisponibles: params.disponible === "1",
    soloOfertas: params.oferta === "1",
    sort: (params.sort as CatalogoSort) ?? "recientes",
    page: params.page ? Number(params.page) : 1,
  };

  const [{ productos, total, page, totalPages }, { marcas, categorias }] = await Promise.all([
    getProductosCatalogo(filtros),
    getFiltrosDisponibles(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/">Inicio</Link> / <span className="font-semibold text-foreground">Catálogo</span>
      </div>
      <h1 className="mb-8 font-display text-4xl">{filtros.soloOfertas ? "Ofertas" : "Todo el catálogo"}</h1>

      <div className="flex gap-10">
        <CatalogoFiltros marcas={marcas} categorias={categorias} />

        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{total} productos</div>
            <CatalogoOrden />
          </div>

          {productos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              No encontramos productos con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          <CatalogoPagination page={page} totalPages={totalPages} searchParams={params} />
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const PAGE_SIZE = 12;

export type CatalogoSort = "recientes" | "precio_asc" | "precio_desc";

export type CatalogoFiltros = {
  q?: string;
  marcaIds?: string[];
  categoriaIds?: string[];
  precioMin?: number;
  precioMax?: number;
  soloDisponibles?: boolean;
  sort?: CatalogoSort;
  page?: number;
};

function buildWhere(filtros: CatalogoFiltros): Prisma.ProductoWhereInput {
  const where: Prisma.ProductoWhereInput = { activo: true };

  if (filtros.q?.trim()) {
    where.nombre = { contains: filtros.q.trim(), mode: "insensitive" };
  }
  if (filtros.marcaIds?.length) {
    where.marcaId = { in: filtros.marcaIds };
  }
  if (filtros.categoriaIds?.length) {
    where.categoriaId = { in: filtros.categoriaIds };
  }
  if (filtros.precioMin != null || filtros.precioMax != null) {
    where.precioVenta = {
      ...(filtros.precioMin != null ? { gte: filtros.precioMin } : {}),
      ...(filtros.precioMax != null ? { lte: filtros.precioMax } : {}),
    };
  }
  if (filtros.soloDisponibles) {
    where.stock = { gt: 0 };
  }

  return where;
}

function buildOrderBy(sort: CatalogoSort | undefined): Prisma.ProductoOrderByWithRelationInput {
  switch (sort) {
    case "precio_asc":
      return { precioVenta: "asc" };
    case "precio_desc":
      return { precioVenta: "desc" };
    case "recientes":
    default:
      return { createdAt: "desc" };
  }
}

export async function getProductosCatalogo(filtros: CatalogoFiltros) {
  const where = buildWhere(filtros);
  const orderBy = buildOrderBy(filtros.sort);
  const page = Math.max(1, filtros.page ?? 1);

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        marca: true,
        ofertas: true,
      },
    }),
    prisma.producto.count({ where }),
  ]);

  return { productos, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFiltrosDisponibles() {
  const [marcas, categorias] = await Promise.all([
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  return { marcas, categorias };
}

export async function getProductoPorSlug(slug: string) {
  return prisma.producto.findUnique({
    where: { slug, activo: true },
    include: {
      marca: true,
      categoria: true,
      imagenes: { orderBy: { orden: "asc" } },
      ofertas: true,
    },
  });
}

export async function getProductosRelacionados(categoriaId: string, excludeId: string) {
  return prisma.producto.findMany({
    where: { categoriaId, activo: true, id: { not: excludeId } },
    include: { marca: true, ofertas: true },
    take: 4,
  });
}

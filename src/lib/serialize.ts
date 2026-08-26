import type { Oferta, Producto } from "@/generated/prisma/client";

// Los campos Decimal de Prisma son instancias de clase, no objetos planos:
// no se pueden pasar de un Server Component a un Client Component. Estas
// funciones los convierten a number antes de cruzar esa frontera.

export type ProductoSerializado = Omit<Producto, "precioVenta" | "precioCompra"> & {
  precioVenta: number;
  precioCompra: number | null;
};

export function serializarProducto(p: Producto): ProductoSerializado {
  return {
    ...p,
    precioVenta: Number(p.precioVenta),
    precioCompra: p.precioCompra != null ? Number(p.precioCompra) : null,
  };
}

export type OfertaSerializada = Omit<Oferta, "valor"> & { valor: number };

export function serializarOferta(o: Oferta): OfertaSerializada {
  return { ...o, valor: Number(o.valor) };
}

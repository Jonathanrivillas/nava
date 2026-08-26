"use client";

import Link from "next/link";
import type { CartItem } from "@/components/cart/cart-context";
import { useCart } from "@/components/cart/cart-context";
import { formatPrecio } from "@/lib/format";
import { gradienteFor } from "@/lib/placeholder";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/storefront/icons";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateCantidad, removeItem } = useCart();

  return (
    <div className="flex items-center gap-5 border-b border-border py-5">
      <div
        className={`h-[88px] w-[88px] shrink-0 rounded-lg bg-gradient-to-br ${gradienteFor(item.productoId)}`}
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {item.marcaNombre}
        </div>
        <Link href={`/producto/${item.slug}`} className="text-[15px] font-semibold text-foreground">
          {item.nombre}
        </Link>
        <div className="text-[13px] text-muted-foreground">{formatPrecio(item.precioUnitario)} c/u</div>
      </div>

      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => updateCantidad(item.productoId, item.cantidad - 1)}
          className="flex h-9 w-8 items-center justify-center text-foreground"
        >
          <MinusIcon width={12} height={12} />
        </button>
        <div className="flex h-9 w-9 items-center justify-center border-x border-border text-[13px] font-semibold">
          {item.cantidad}
        </div>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() => updateCantidad(item.productoId, item.cantidad + 1)}
          className="flex h-9 w-8 items-center justify-center text-foreground disabled:opacity-40"
          disabled={item.cantidad >= item.stock}
        >
          <PlusIcon width={12} height={12} />
        </button>
      </div>

      <div className="w-24 text-right text-[15px] font-bold">
        {formatPrecio(item.cantidad * item.precioUnitario)}
      </div>

      <button
        type="button"
        aria-label="Quitar del carrito"
        onClick={() => removeItem(item.productoId)}
        className="text-muted-foreground hover:text-destructive"
      >
        <TrashIcon width={18} height={18} />
      </button>
    </div>
  );
}

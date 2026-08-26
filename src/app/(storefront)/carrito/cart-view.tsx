"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { Button } from "@/components/ui/button";
import { formatPrecio } from "@/lib/format";
import { ChevronRightIcon } from "@/components/storefront/icons";

export function CartView() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10">
        <h1 className="mb-3 font-display text-3xl">Tu carrito está vacío</h1>
        <p className="mb-6 text-muted-foreground">Explora el catálogo y encuentra tu próximo favorito.</p>
        <Link href="/catalogo">
          <Button>Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <h1 className="mb-8 font-display text-4xl">
        Tu carrito{" "}
        <span className="font-sans text-xl text-muted-foreground">
          ({items.reduce((a, i) => a + i.cantidad, 0)} productos)
        </span>
      </h1>

      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex flex-1 flex-col">
          {items.map((item) => (
            <CartItemRow key={item.productoId} item={item} />
          ))}

          <Link
            href="/catalogo"
            className="mt-5 flex w-fit items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <ChevronRightIcon width={14} height={14} className="rotate-180" />
            Seguir comprando
          </Link>
        </div>

        <div className="w-full lg:w-96 lg:shrink-0">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-7">
            <h3 className="text-lg font-semibold">Resumen del pedido</h3>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm text-foreground/80">
                <span>Subtotal</span>
                <span>{formatPrecio(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span>Se calcula en el checkout</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total estimado</span>
                <span>{formatPrecio(subtotal)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="h-12 w-full text-[15px]">Continuar al pago</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

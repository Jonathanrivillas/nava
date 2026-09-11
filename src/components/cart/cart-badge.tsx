"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { CartIcon } from "@/components/storefront/icons";

export function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/carrito" className="relative flex items-center" aria-label="Ver carrito">
      <CartIcon />
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

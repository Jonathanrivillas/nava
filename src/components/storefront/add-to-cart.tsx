"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { CartIcon, MinusIcon, PlusIcon } from "@/components/storefront/icons";

export function AddToCart({
  producto,
}: {
  producto: {
    id: string;
    slug: string;
    nombre: string;
    marcaNombre: string;
    precioUnitario: number;
    stock: number;
  };
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productoId: producto.id,
        slug: producto.slug,
        nombre: producto.nombre,
        marcaNombre: producto.marcaNombre,
        precioUnitario: producto.precioUnitario,
        stock: producto.stock,
      },
      qty,
    );
    setAgregado(true);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-5">
        <div className="flex items-center overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-10 items-center justify-center text-foreground disabled:opacity-40"
            disabled={qty <= 1 || agotado}
          >
            <MinusIcon width={14} height={14} />
          </button>
          <div className="flex h-11 w-11 items-center justify-center border-x border-border text-sm font-semibold">
            {qty}
          </div>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            onClick={() => setQty((q) => Math.min(Math.max(1, producto.stock), q + 1))}
            className="flex h-11 w-10 items-center justify-center text-foreground disabled:opacity-40"
            disabled={qty >= producto.stock || agotado}
          >
            <PlusIcon width={14} height={14} />
          </button>
        </div>
        <Button
          disabled={agotado}
          onClick={handleAdd}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg text-sm"
        >
          <CartIcon width={18} height={18} />
          {agotado ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
      {agregado && !agotado && (
        <p className="text-xs font-medium text-success">Agregado al carrito.</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/components/storefront/icons";

export function QuantitySelector({ max }: { max: number }) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-border">
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="flex h-11 w-10 items-center justify-center text-foreground disabled:opacity-40"
        disabled={qty <= 1}
      >
        <MinusIcon width={14} height={14} />
      </button>
      <div className="flex h-11 w-11 items-center justify-center border-x border-border text-sm font-semibold">
        {qty}
      </div>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        className="flex h-11 w-10 items-center justify-center text-foreground disabled:opacity-40"
        disabled={qty >= max}
      >
        <PlusIcon width={14} height={14} />
      </button>
    </div>
  );
}

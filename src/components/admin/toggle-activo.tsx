"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleActivoProducto } from "@/app/admin/productos/actions";

export function ToggleActivo({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimista, setOptimista] = useState(activo);

  function onClick() {
    const nuevoValor = !optimista;
    setOptimista(nuevoValor);
    startTransition(async () => {
      await toggleActivoProducto(id, nuevoValor);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold disabled:opacity-60 ${
        optimista ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {optimista ? "Activo" : "Inactivo"}
    </button>
  );
}

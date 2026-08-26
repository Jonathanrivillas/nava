"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarOferta } from "@/app/admin/ofertas/actions";
import { TrashIcon } from "@/components/storefront/icons";

export function EliminarOfertaButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("¿Eliminar esta oferta?")) return;
    startTransition(async () => {
      await eliminarOferta(id);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive disabled:opacity-50"
    >
      <TrashIcon width={15} height={15} />
    </button>
  );
}

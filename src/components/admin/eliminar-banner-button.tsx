"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarBanner } from "@/app/admin/banners/actions";
import { TrashIcon } from "@/components/storefront/icons";

export function EliminarBannerButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("¿Eliminar este banner?")) return;
    startTransition(async () => {
      await eliminarBanner(id);
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

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EliminarBannerButton } from "@/components/admin/eliminar-banner-button";
import { PlusIcon, EditIcon, ImagePlaceholderIcon } from "@/components/storefront/icons";

export const metadata: Metadata = {
  title: "Banners — Admin Nava",
};

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { orden: "asc" } });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Banners</h1>
        <Link href="/admin/banners/nuevo">
          <Button className="gap-2">
            <PlusIcon width={14} height={14} />
            Nuevo banner
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <div key={b.id} className="flex flex-col gap-3 rounded-xl border border-border p-4">
            <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {b.imagenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imagenUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlaceholderIcon width={24} height={24} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{b.texto || "(sin texto)"}</div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  b.activo ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {b.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Orden: {b.orden}</div>
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link
                href={`/admin/banners/${b.id}/editar`}
                className="text-muted-foreground hover:text-foreground"
              >
                <EditIcon width={15} height={15} />
              </Link>
              <EliminarBannerButton id={b.id} />
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No hay banners todavía.
          </div>
        )}
      </div>
    </div>
  );
}

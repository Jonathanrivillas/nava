"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Banner } from "@/generated/prisma/client";
import { crearBanner, actualizarBanner, subirImagenBanner } from "@/app/admin/banners/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploader } from "@/components/admin/image-uploader";

function toDateInputValue(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const input = {
      imagenUrl: String(formData.get("imagenUrl") ?? ""),
      texto: String(formData.get("texto") ?? ""),
      link: String(formData.get("link") ?? ""),
      orden: Number(formData.get("orden") ?? 0),
      fechaInicio: String(formData.get("fechaInicio") ?? ""),
      fechaFin: String(formData.get("fechaFin") ?? ""),
      activo: formData.get("activo") === "on",
    };

    const resultado = banner ? await actualizarBanner(banner.id, input) : await crearBanner(input);

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    router.push("/admin/banners");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label>Imagen del banner</Label>
        <ImageUploader name="imagenUrl" defaultValue={banner?.imagenUrl} accion={subirImagenBanner} />
        {fieldErrors.imagenUrl && <p className="text-xs text-destructive">{fieldErrors.imagenUrl}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="texto">
          Texto <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input id="texto" name="texto" placeholder="Nueva colección" defaultValue={banner?.texto ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="link">
          Enlace al hacer clic <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input id="link" name="link" placeholder="/catalogo" defaultValue={banner?.link ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orden">Orden</Label>
          <Input id="orden" name="orden" type="number" step="1" defaultValue={banner?.orden ?? 0} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaInicio">
            Desde <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            defaultValue={toDateInputValue(banner?.fechaInicio ?? null)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaFin">
            Hasta <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="fechaFin"
            name="fechaFin"
            type="date"
            defaultValue={toDateInputValue(banner?.fechaFin ?? null)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium">
        <Checkbox name="activo" defaultChecked={banner?.activo ?? true} />
        Banner activo (visible en el Home)
      </label>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar banner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/banners")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

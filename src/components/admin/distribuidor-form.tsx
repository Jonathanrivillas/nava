"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Distribuidor } from "@/generated/prisma/client";
import { crearDistribuidor, actualizarDistribuidor } from "@/app/admin/distribuidores/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DistribuidorForm({ distribuidor }: { distribuidor?: Distribuidor }) {
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
      nombre: String(formData.get("nombre") ?? ""),
      contacto: String(formData.get("contacto") ?? ""),
      direccion: String(formData.get("direccion") ?? ""),
      notas: String(formData.get("notas") ?? ""),
    };

    const resultado = distribuidor
      ? await actualizarDistribuidor(distribuidor.id, input)
      : await crearDistribuidor(input);

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    router.push("/admin/distribuidores");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={distribuidor?.nombre} required />
        {fieldErrors.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contacto">
          Contacto <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input id="contacto" name="contacto" placeholder="Teléfono o correo" defaultValue={distribuidor?.contacto ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="direccion">
          Dirección <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input id="direccion" name="direccion" defaultValue={distribuidor?.direccion ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notas">
          Notas <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <textarea
          id="notas"
          name="notas"
          defaultValue={distribuidor?.notas ?? ""}
          rows={3}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar distribuidor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/distribuidores")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

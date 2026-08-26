"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OfertaSerializada, ProductoSerializado } from "@/lib/serialize";
import { crearOferta, actualizarOferta } from "@/app/admin/ofertas/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function OfertaForm({
  oferta,
  productos,
}: {
  oferta?: OfertaSerializada;
  productos: ProductoSerializado[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"PORCENTAJE" | "MONTO_FIJO">(oferta?.tipo ?? "PORCENTAJE");
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
      productoId: String(formData.get("productoId") ?? ""),
      tipo,
      valor: Number(formData.get("valor") ?? 0),
      fechaInicio: String(formData.get("fechaInicio") ?? ""),
      fechaFin: String(formData.get("fechaFin") ?? ""),
    };

    const resultado = oferta ? await actualizarOferta(oferta.id, input) : await crearOferta(input);

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    router.push("/admin/ofertas");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="productoId">Producto</Label>
        <Select
          items={productos.map((p) => ({ value: p.id, label: p.nombre }))}
          name="productoId"
          defaultValue={oferta?.productoId}
        >
          <SelectTrigger id="productoId" className="w-full">
            <SelectValue placeholder="Selecciona un producto" />
          </SelectTrigger>
          <SelectContent>
            {productos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.productoId && <p className="text-xs text-destructive">{fieldErrors.productoId}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo de descuento</Label>
          <Select
            items={[
              { value: "PORCENTAJE", label: "Porcentaje (%)" },
              { value: "MONTO_FIJO", label: "Monto fijo ($)" },
            ]}
            value={tipo}
            onValueChange={(v) => v && setTipo(v as "PORCENTAJE" | "MONTO_FIJO")}
          >
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PORCENTAJE">Porcentaje (%)</SelectItem>
              <SelectItem value="MONTO_FIJO">Monto fijo ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valor">{tipo === "PORCENTAJE" ? "Porcentaje de descuento" : "Monto a descontar"}</Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            min="0"
            max={tipo === "PORCENTAJE" ? "100" : undefined}
            step="1"
            defaultValue={oferta ? Number(oferta.valor) : undefined}
            required
          />
          {fieldErrors.valor && <p className="text-xs text-destructive">{fieldErrors.valor}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaInicio">Fecha de inicio</Label>
          <Input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            defaultValue={oferta ? toDateInputValue(oferta.fechaInicio) : undefined}
            required
          />
          {fieldErrors.fechaInicio && (
            <p className="text-xs text-destructive">{fieldErrors.fechaInicio}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaFin">Fecha de fin</Label>
          <Input
            id="fechaFin"
            name="fechaFin"
            type="date"
            defaultValue={oferta ? toDateInputValue(oferta.fechaFin) : undefined}
            required
          />
          {fieldErrors.fechaFin && <p className="text-xs text-destructive">{fieldErrors.fechaFin}</p>}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar oferta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/ofertas")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

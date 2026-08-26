"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Producto } from "@/generated/prisma/client";
import { registrarMovimiento } from "@/app/admin/inventario/actions";
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

export function MovimientoForm({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const resultado = await registrarMovimiento({
      productoId: String(formData.get("productoId") ?? ""),
      tipo,
      cantidad: Number(formData.get("cantidad") ?? 0),
      motivo: String(formData.get("motivo") ?? ""),
    });

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    setEnviando(false);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold">Movimiento manual</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mov-productoId">Producto</Label>
          <Select
            items={productos.map((p) => ({ value: p.id, label: `${p.nombre} (stock: ${p.stock})` }))}
            name="productoId"
          >
            <SelectTrigger id="mov-productoId">
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {productos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre} (stock: {p.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.productoId && <p className="text-xs text-destructive">{fieldErrors.productoId}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mov-tipo">Tipo</Label>
          <Select
            items={[
              { value: "ENTRADA", label: "Entrada" },
              { value: "SALIDA", label: "Salida" },
            ]}
            value={tipo}
            onValueChange={(v) => v && setTipo(v as "ENTRADA" | "SALIDA")}
          >
            <SelectTrigger id="mov-tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTRADA">Entrada</SelectItem>
              <SelectItem value="SALIDA">Salida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mov-cantidad">Cantidad</Label>
          <Input id="mov-cantidad" name="cantidad" type="number" min="1" step="1" required />
          {fieldErrors.cantidad && <p className="text-xs text-destructive">{fieldErrors.cantidad}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mov-motivo">Motivo</Label>
          <Input id="mov-motivo" name="motivo" placeholder="Ej. mercancía dañada, ajuste de conteo" required />
          {fieldErrors.motivo && <p className="text-xs text-destructive">{fieldErrors.motivo}</p>}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" disabled={enviando} className="w-fit">
        {enviando ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}

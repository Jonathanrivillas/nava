"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Distribuidor } from "@/generated/prisma/client";
import type { ProductoSerializado } from "@/lib/serialize";
import { registrarCompraDistribuidor } from "@/app/admin/inventario/actions";
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

export function CompraDistribuidorForm({
  productos,
  distribuidores,
}: {
  productos: ProductoSerializado[];
  distribuidores: Distribuidor[];
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const productosDropshipping = productos.filter((p) => p.tipo === "DROPSHIPPING");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const resultado = await registrarCompraDistribuidor({
      distribuidorId: String(formData.get("distribuidorId") ?? ""),
      productoId: String(formData.get("productoId") ?? ""),
      cantidad: Number(formData.get("cantidad") ?? 0),
      costoUnitario: Number(formData.get("costoUnitario") ?? 0),
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

  if (distribuidores.length === 0 || productosDropshipping.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
        <h3 className="text-sm font-semibold text-foreground">Compra a distribuidor</h3>
        Necesitas al menos un distribuidor y un producto de tipo dropshipping para registrar compras.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold">Compra a distribuidor</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compra-distribuidorId">Distribuidor</Label>
          <Select
            items={distribuidores.map((d) => ({ value: d.id, label: d.nombre }))}
            name="distribuidorId"
          >
            <SelectTrigger id="compra-distribuidorId" className="w-full">
              <SelectValue placeholder="Selecciona un distribuidor" />
            </SelectTrigger>
            <SelectContent>
              {distribuidores.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.distribuidorId && (
            <p className="text-xs text-destructive">{fieldErrors.distribuidorId}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compra-productoId">Producto</Label>
          <Select
            items={productosDropshipping.map((p) => ({ value: p.id, label: p.nombre }))}
            name="productoId"
          >
            <SelectTrigger id="compra-productoId" className="w-full">
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {productosDropshipping.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.productoId && <p className="text-xs text-destructive">{fieldErrors.productoId}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compra-cantidad">Cantidad</Label>
          <Input id="compra-cantidad" name="cantidad" type="number" min="1" step="1" required />
          {fieldErrors.cantidad && <p className="text-xs text-destructive">{fieldErrors.cantidad}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compra-costoUnitario">Costo unitario</Label>
          <Input id="compra-costoUnitario" name="costoUnitario" type="number" min="0" step="1" required />
          {fieldErrors.costoUnitario && (
            <p className="text-xs text-destructive">{fieldErrors.costoUnitario}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Button type="submit" disabled={enviando} className="w-fit">
        {enviando ? "Registrando..." : "Registrar compra"}
      </Button>
    </form>
  );
}

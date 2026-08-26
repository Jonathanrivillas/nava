"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria, Distribuidor, Marca, Producto } from "@/generated/prisma/client";
import { crearProducto, actualizarProducto, subirImagenProducto } from "@/app/admin/productos/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/admin/image-uploader";

export function ProductoForm({
  producto,
  marcas,
  categorias,
  distribuidores,
}: {
  producto?: Producto;
  marcas: Marca[];
  categorias: Categoria[];
  distribuidores: Distribuidor[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"PROPIO" | "DROPSHIPPING">(producto?.tipo ?? "PROPIO");
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
      marcaId: String(formData.get("marcaId") ?? ""),
      categoriaId: String(formData.get("categoriaId") ?? ""),
      descripcion: String(formData.get("descripcion") ?? ""),
      precioVenta: Number(formData.get("precioVenta") ?? 0),
      precioCompra: formData.get("precioCompra") ? Number(formData.get("precioCompra")) : undefined,
      tipo,
      distribuidorId: String(formData.get("distribuidorId") ?? ""),
      stock: Number(formData.get("stock") ?? 0),
      imagenPrincipal: String(formData.get("imagenPrincipal") ?? ""),
      activo: formData.get("activo") === "on",
    };

    const resultado = producto
      ? await actualizarProducto(producto.id, input)
      : await crearProducto(input);

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre del producto</Label>
        <Input id="nombre" name="nombre" defaultValue={producto?.nombre} required />
        {fieldErrors.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="marcaId">Marca</Label>
          <Select
            items={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
            name="marcaId"
            defaultValue={producto?.marcaId}
          >
            <SelectTrigger id="marcaId" className="w-full">
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.marcaId && <p className="text-xs text-destructive">{fieldErrors.marcaId}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoriaId">Categoría</Label>
          <Select
            items={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            name="categoriaId"
            defaultValue={producto?.categoriaId}
          >
            <SelectTrigger id="categoriaId" className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.categoriaId && (
            <p className="text-xs text-destructive">{fieldErrors.categoriaId}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">
          Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={producto?.descripcion ?? ""}
          rows={3}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="precioVenta">Precio de venta</Label>
          <Input
            id="precioVenta"
            name="precioVenta"
            type="number"
            min="0"
            step="1"
            defaultValue={producto ? Number(producto.precioVenta) : undefined}
            required
          />
          {fieldErrors.precioVenta && (
            <p className="text-xs text-destructive">{fieldErrors.precioVenta}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="precioCompra">
            Precio de compra <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="precioCompra"
            name="precioCompra"
            type="number"
            min="0"
            step="1"
            defaultValue={producto?.precioCompra ? Number(producto.precioCompra) : undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={producto?.stock ?? 0}
            required
          />
          {fieldErrors.stock && <p className="text-xs text-destructive">{fieldErrors.stock}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipo">Tipo</Label>
          <Select
            items={[
              { value: "PROPIO", label: "Inventario propio" },
              { value: "DROPSHIPPING", label: "Dropshipping" },
            ]}
            value={tipo}
            onValueChange={(v) => v && setTipo(v as "PROPIO" | "DROPSHIPPING")}
          >
            <SelectTrigger id="tipo" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROPIO">Inventario propio</SelectItem>
              <SelectItem value="DROPSHIPPING">Dropshipping</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tipo === "DROPSHIPPING" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="distribuidorId">Distribuidor</Label>
            <Select
              items={distribuidores.map((d) => ({ value: d.id, label: d.nombre }))}
              name="distribuidorId"
              defaultValue={producto?.distribuidorId ?? undefined}
            >
              <SelectTrigger id="distribuidorId" className="w-full">
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
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Imagen del producto</Label>
        <ImageUploader
          name="imagenPrincipal"
          defaultValue={producto?.imagenPrincipal}
          accion={subirImagenProducto}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium">
        <Checkbox name="activo" defaultChecked={producto?.activo ?? true} />
        Producto activo (visible en el catálogo)
      </label>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

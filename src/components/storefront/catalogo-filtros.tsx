"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { Categoria, Marca } from "@/generated/prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CatalogoFiltros({
  marcas,
  categorias,
}: {
  marcas: Marca[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const marcaIds = searchParams.get("marca")?.split(",").filter(Boolean) ?? [];
  const categoriaIds = searchParams.get("categoria")?.split(",").filter(Boolean) ?? [];
  const soloDisponibles = searchParams.get("disponible") === "1";

  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") ?? "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  function toggleValue(param: "marca" | "categoria", id: string, current: string[]) {
    const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
    updateParams({ [param]: next.length ? next.join(",") : null });
  }

  function clearFiltros() {
    setPrecioMin("");
    setPrecioMax("");
    router.push(pathname);
  }

  const hayFiltros =
    marcaIds.length > 0 ||
    categoriaIds.length > 0 ||
    soloDisponibles ||
    searchParams.has("precioMin") ||
    searchParams.has("precioMax") ||
    searchParams.has("q");

  return (
    <div className="flex w-64 shrink-0 flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">Marca</div>
        {marcas.map((marca) => (
          <label key={marca.id} className="flex items-center gap-2.5 text-sm">
            <Checkbox
              checked={marcaIds.includes(marca.id)}
              onCheckedChange={() => toggleValue("marca", marca.id, marcaIds)}
            />
            {marca.nombre}
          </label>
        ))}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">Categoría</div>
        {categorias
          .filter((c) => c.categoriaPadreId !== null)
          .map((categoria) => (
            <label key={categoria.id} className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={categoriaIds.includes(categoria.id)}
                onCheckedChange={() => toggleValue("categoria", categoria.id, categoriaIds)}
              />
              {categoria.nombre}
            </label>
          ))}
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-3">
        <div className="text-sm font-bold">Precio</div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Mín"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            onBlur={() => updateParams({ precioMin: precioMin || null })}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Máx"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            onBlur={() => updateParams({ precioMax: precioMax || null })}
            className="h-9"
          />
        </div>
      </div>

      <div className="h-px bg-border" />

      <label className="flex items-center gap-2.5 text-sm font-medium">
        <Checkbox
          checked={soloDisponibles}
          onCheckedChange={(checked) => updateParams({ disponible: checked ? "1" : null })}
        />
        Solo disponibles
      </label>

      {hayFiltros && (
        <Button variant="outline" size="sm" onClick={clearFiltros}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { subirImagenProducto } from "@/app/admin/productos/actions";
import { UploadIcon, ImagePlaceholderIcon } from "@/components/storefront/icons";

export function ImageUploader({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSubiendo(true);

    const resultado = await subirImagenProducto(file);

    if (!resultado.ok) {
      setError(resultado.error);
    } else {
      setUrl(resultado.url);
    }
    setSubiendo(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholderIcon width={26} height={26} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <UploadIcon width={14} height={14} />
            {subiendo ? "Subiendo..." : url ? "Cambiar imagen" : "Subir imagen"}
          </button>
          <p className="text-xs text-muted-foreground">PNG, JPG o WEBP — máximo 5MB</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileSelected}
        className="hidden"
      />
    </div>
  );
}

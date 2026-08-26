import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la service_role key: solo debe importarse desde código de servidor
// (Server Actions, Route Handlers). El import "server-only" hace fallar el build
// si algo intenta incluir este archivo en un bundle de cliente.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Bucket público único para imágenes administrables (productos, banners, ...),
// organizado por carpeta dentro del mismo bucket.
export const IMAGENES_BUCKET = "productos";

export type SubirImagenResult = { ok: true; url: string } | { ok: false; error: string };

export async function subirImagen(file: File, carpeta: string): Promise<SubirImagenResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "La imagen no debe superar 5MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(IMAGENES_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { ok: false, error: "No se pudo subir la imagen. Intenta de nuevo." };
  }

  const { data } = supabaseAdmin.storage.from(IMAGENES_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

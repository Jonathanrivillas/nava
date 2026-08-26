"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { supabaseAdmin, PRODUCTOS_BUCKET } from "@/lib/supabase-admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN_SOCIO") {
    throw new Error("No autorizado");
  }
}

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generarSlugUnico(base: string, idExcluido?: string) {
  const raiz = base || "producto";
  let slug = raiz;
  let i = 1;
  while (true) {
    const existente = await prisma.producto.findUnique({ where: { slug } });
    if (!existente || existente.id === idExcluido) return slug;
    slug = `${raiz}-${i}`;
    i++;
  }
}

const productoSchema = z
  .object({
    nombre: z.string().trim().min(3, "Ingresa el nombre del producto"),
    marcaId: z.string().min(1, "Selecciona una marca"),
    categoriaId: z.string().min(1, "Selecciona una categoría"),
    descripcion: z.string().trim().optional(),
    precioVenta: z.coerce.number().positive("El precio debe ser mayor a 0"),
    precioCompra: z.coerce.number().nonnegative().optional(),
    tipo: z.enum(["PROPIO", "DROPSHIPPING"]),
    distribuidorId: z.string().optional(),
    stock: z.coerce.number().int().nonnegative("El stock no puede ser negativo"),
    imagenPrincipal: z.string().optional(),
    activo: z.coerce.boolean(),
  })
  .refine((data) => data.tipo !== "DROPSHIPPING" || !!data.distribuidorId, {
    message: "Selecciona un distribuidor para productos de dropshipping",
    path: ["distribuidorId"],
  });

export type ProductoInput = z.infer<typeof productoSchema>;

export type ProductoResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: z.ZodError): ProductoResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
}

export async function crearProducto(input: ProductoInput): Promise<ProductoResult> {
  await requireAdmin();
  const parsed = productoSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  const slug = await generarSlugUnico(slugify(data.nombre));

  const producto = await prisma.producto.create({
    data: {
      slug,
      nombre: data.nombre,
      marcaId: data.marcaId,
      categoriaId: data.categoriaId,
      descripcion: data.descripcion || null,
      precioVenta: data.precioVenta,
      precioCompra: data.precioCompra ?? null,
      tipo: data.tipo,
      distribuidorId: data.tipo === "DROPSHIPPING" ? data.distribuidorId : null,
      stock: data.stock,
      imagenPrincipal: data.imagenPrincipal || null,
      activo: data.activo,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { ok: true, id: producto.id };
}

export async function actualizarProducto(id: string, input: ProductoInput): Promise<ProductoResult> {
  await requireAdmin();
  const parsed = productoSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  const producto = await prisma.producto.update({
    where: { id },
    data: {
      nombre: data.nombre,
      marcaId: data.marcaId,
      categoriaId: data.categoriaId,
      descripcion: data.descripcion || null,
      precioVenta: data.precioVenta,
      precioCompra: data.precioCompra ?? null,
      tipo: data.tipo,
      distribuidorId: data.tipo === "DROPSHIPPING" ? data.distribuidorId : null,
      stock: data.stock,
      imagenPrincipal: data.imagenPrincipal || null,
      activo: data.activo,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath(`/producto/${producto.slug}`);
  return { ok: true, id };
}

export async function toggleActivoProducto(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.producto.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}

export type SubirImagenResult = { ok: true; url: string } | { ok: false; error: string };

export async function subirImagenProducto(file: File): Promise<SubirImagenResult> {
  await requireAdmin();

  if (!file || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "La imagen no debe superar 5MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(PRODUCTOS_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return { ok: false, error: "No se pudo subir la imagen. Intenta de nuevo." };
  }

  const { data } = supabaseAdmin.storage.from(PRODUCTOS_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function getFormOptions() {
  const [marcas, categorias, distribuidores] = await Promise.all([
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
    prisma.categoria.findMany({ where: { categoriaPadreId: { not: null } }, orderBy: { nombre: "asc" } }),
    prisma.distribuidor.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  return { marcas, categorias, distribuidores };
}

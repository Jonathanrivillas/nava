"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { subirImagen, type SubirImagenResult } from "@/lib/supabase-admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN_SOCIO") {
    throw new Error("No autorizado");
  }
}

const bannerSchema = z.object({
  imagenUrl: z.string().min(1, "Sube una imagen para el banner"),
  texto: z.string().trim().optional(),
  link: z.string().trim().optional(),
  orden: z.coerce.number().int(),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  activo: z.coerce.boolean(),
});

export type BannerInput = z.infer<typeof bannerSchema>;

export type BannerResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: z.ZodError): BannerResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
}

function buildData(data: BannerInput) {
  return {
    imagenUrl: data.imagenUrl,
    texto: data.texto || null,
    link: data.link || null,
    orden: data.orden,
    fechaInicio: data.fechaInicio ? new Date(`${data.fechaInicio}T00:00:00`) : null,
    fechaFin: data.fechaFin ? new Date(`${data.fechaFin}T23:59:59.999`) : null,
    activo: data.activo,
  };
}

export async function crearBanner(input: BannerInput): Promise<BannerResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);

  const banner = await prisma.banner.create({ data: buildData(parsed.data) });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true, id: banner.id };
}

export async function actualizarBanner(id: string, input: BannerInput): Promise<BannerResult> {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);

  await prisma.banner.update({ where: { id }, data: buildData(parsed.data) });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { ok: true, id };
}

export async function eliminarBanner(id: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function subirImagenBanner(file: File): Promise<SubirImagenResult> {
  await requireAdmin();
  return subirImagen(file, "banners");
}

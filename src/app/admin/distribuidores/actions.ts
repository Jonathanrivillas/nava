"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN_SOCIO") {
    throw new Error("No autorizado");
  }
}

const distribuidorSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre del distribuidor"),
  contacto: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
  notas: z.string().trim().optional(),
});

export type DistribuidorInput = z.infer<typeof distribuidorSchema>;

export type DistribuidorResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: z.ZodError): DistribuidorResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
}

function buildData(data: DistribuidorInput) {
  return {
    nombre: data.nombre,
    contacto: data.contacto || null,
    direccion: data.direccion || null,
    notas: data.notas || null,
  };
}

export async function crearDistribuidor(input: DistribuidorInput): Promise<DistribuidorResult> {
  await requireAdmin();
  const parsed = distribuidorSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);

  const distribuidor = await prisma.distribuidor.create({ data: buildData(parsed.data) });

  revalidatePath("/admin/distribuidores");
  return { ok: true, id: distribuidor.id };
}

export async function actualizarDistribuidor(
  id: string,
  input: DistribuidorInput,
): Promise<DistribuidorResult> {
  await requireAdmin();
  const parsed = distribuidorSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);

  await prisma.distribuidor.update({ where: { id }, data: buildData(parsed.data) });

  revalidatePath("/admin/distribuidores");
  return { ok: true, id };
}

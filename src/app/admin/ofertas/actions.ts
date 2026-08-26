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

const ofertaSchema = z
  .object({
    productoId: z.string().min(1, "Selecciona un producto"),
    tipo: z.enum(["PORCENTAJE", "MONTO_FIJO"]),
    valor: z.coerce.number().positive("El valor debe ser mayor a 0"),
    fechaInicio: z.string().min(1, "Selecciona la fecha de inicio"),
    fechaFin: z.string().min(1, "Selecciona la fecha de fin"),
  })
  .refine((data) => new Date(data.fechaFin) >= new Date(data.fechaInicio), {
    message: "La fecha de fin debe ser igual o posterior a la de inicio",
    path: ["fechaFin"],
  })
  .refine((data) => data.tipo !== "PORCENTAJE" || data.valor <= 100, {
    message: "Un descuento por porcentaje no puede ser mayor a 100",
    path: ["valor"],
  });

export type OfertaInput = z.infer<typeof ofertaSchema>;

export type OfertaResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: z.ZodError): OfertaResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
}

async function validarSinTraslape(
  productoId: string,
  fechaInicio: Date,
  fechaFin: Date,
  idExcluido?: string,
) {
  const traslape = await prisma.oferta.findFirst({
    where: {
      productoId,
      id: idExcluido ? { not: idExcluido } : undefined,
      fechaInicio: { lte: fechaFin },
      fechaFin: { gte: fechaInicio },
    },
  });
  return !traslape;
}

export async function crearOferta(input: OfertaInput): Promise<OfertaResult> {
  await requireAdmin();
  const parsed = ofertaSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  const fechaInicio = new Date(`${data.fechaInicio}T00:00:00`);
  const fechaFin = new Date(`${data.fechaFin}T23:59:59.999`);

  const sinTraslape = await validarSinTraslape(data.productoId, fechaInicio, fechaFin);
  if (!sinTraslape) {
    return {
      ok: false,
      error: "Este producto ya tiene una oferta programada que se cruza con esas fechas.",
      fieldErrors: { fechaInicio: "Se cruza con otra oferta del mismo producto" },
    };
  }

  const oferta = await prisma.oferta.create({
    data: {
      productoId: data.productoId,
      tipo: data.tipo,
      valor: data.valor,
      fechaInicio,
      fechaFin,
    },
  });

  revalidatePath("/admin/ofertas");
  revalidatePath("/catalogo");
  return { ok: true, id: oferta.id };
}

export async function actualizarOferta(id: string, input: OfertaInput): Promise<OfertaResult> {
  await requireAdmin();
  const parsed = ofertaSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  const fechaInicio = new Date(`${data.fechaInicio}T00:00:00`);
  const fechaFin = new Date(`${data.fechaFin}T23:59:59.999`);

  const sinTraslape = await validarSinTraslape(data.productoId, fechaInicio, fechaFin, id);
  if (!sinTraslape) {
    return {
      ok: false,
      error: "Este producto ya tiene una oferta programada que se cruza con esas fechas.",
      fieldErrors: { fechaInicio: "Se cruza con otra oferta del mismo producto" },
    };
  }

  await prisma.oferta.update({
    where: { id },
    data: {
      productoId: data.productoId,
      tipo: data.tipo,
      valor: data.valor,
      fechaInicio,
      fechaFin,
    },
  });

  revalidatePath("/admin/ofertas");
  revalidatePath("/catalogo");
  return { ok: true, id };
}

export async function eliminarOferta(id: string) {
  await requireAdmin();
  await prisma.oferta.delete({ where: { id } });
  revalidatePath("/admin/ofertas");
  revalidatePath("/catalogo");
}

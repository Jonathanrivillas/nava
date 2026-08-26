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

export type AccionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: z.ZodError): AccionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
}

const movimientoSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  tipo: z.enum(["ENTRADA", "SALIDA"]),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  motivo: z.string().trim().min(3, "Describe el motivo del movimiento"),
});

export type MovimientoInput = z.infer<typeof movimientoSchema>;

export async function registrarMovimiento(input: MovimientoInput): Promise<AccionResult> {
  await requireAdmin();
  const parsed = movimientoSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findUniqueOrThrow({ where: { id: data.productoId } });

    if (data.tipo === "SALIDA" && producto.stock < data.cantidad) {
      throw new Error(`Stock insuficiente (disponible: ${producto.stock}).`);
    }

    await tx.producto.update({
      where: { id: data.productoId },
      data: { stock: data.tipo === "ENTRADA" ? { increment: data.cantidad } : { decrement: data.cantidad } },
    });

    await tx.movimientoInventario.create({
      data: {
        productoId: data.productoId,
        tipo: data.tipo,
        cantidad: data.cantidad,
        motivo: data.motivo,
      },
    });
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { ok: true };
}

const compraSchema = z.object({
  distribuidorId: z.string().min(1, "Selecciona un distribuidor"),
  productoId: z.string().min(1, "Selecciona un producto"),
  cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  costoUnitario: z.coerce.number().positive("El costo debe ser mayor a 0"),
});

export type CompraInput = z.infer<typeof compraSchema>;

export async function registrarCompraDistribuidor(input: CompraInput): Promise<AccionResult> {
  await requireAdmin();
  const parsed = compraSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsFrom(parsed.error);
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    const distribuidor = await tx.distribuidor.findUniqueOrThrow({ where: { id: data.distribuidorId } });

    await tx.compraDistribuidor.create({
      data: {
        distribuidorId: data.distribuidorId,
        productoId: data.productoId,
        cantidad: data.cantidad,
        costoUnitario: data.costoUnitario,
      },
    });

    await tx.producto.update({
      where: { id: data.productoId },
      data: { stock: { increment: data.cantidad } },
    });

    await tx.movimientoInventario.create({
      data: {
        productoId: data.productoId,
        tipo: "ENTRADA",
        cantidad: data.cantidad,
        motivo: `Compra a distribuidor: ${distribuidor.nombre}`,
      },
    });
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { ok: true };
}

export async function getInventarioOptions() {
  const [productos, distribuidores] = await Promise.all([
    prisma.producto.findMany({ orderBy: { nombre: "asc" } }),
    prisma.distribuidor.findMany({ orderBy: { nombre: "asc" } }),
  ]);
  return { productos, distribuidores };
}

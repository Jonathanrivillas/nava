"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Prisma } from "@/generated/prisma/client";
import { calcularPrecioFinal, getOfertaActiva } from "@/lib/ofertas";

const itemSchema = z.object({
  productoId: z.string().min(1),
  cantidad: z.number().int().positive(),
});

const checkoutSchema = z.object({
  nombreContacto: z.string().trim().min(3, "Ingresa tu nombre completo"),
  telefonoContacto: z.string().trim().min(7, "Ingresa un teléfono válido"),
  emailContacto: z
    .email("Correo inválido")
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  direccionEnvio: z.string().trim().min(5, "Ingresa la dirección de envío"),
  ciudad: z.string().trim().min(2, "Ingresa la ciudad"),
  referencia: z.string().trim().optional(),
  metodoPago: z.enum(["CONTRA_ENTREGA", "TRANSFERENCIA"]),
  items: z.array(itemSchema).min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CrearPedidoResult =
  | { ok: true; pedidoId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function crearPedido(input: CheckoutInput): Promise<CrearPedidoResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
  }

  const data = parsed.data;
  const session = await auth();

  try {
    const pedidoId = await prisma.$transaction(async (tx) => {
      const productoIds = data.items.map((i) => i.productoId);
      const productos = await tx.producto.findMany({
        where: { id: { in: productoIds }, activo: true },
        include: { ofertas: true },
      });

      if (productos.length !== productoIds.length) {
        throw new Error("Uno de los productos de tu carrito ya no está disponible.");
      }

      let subtotal = 0;
      const pedidoItemsData: Prisma.PedidoItemCreateManyPedidoInput[] = [];
      const movimientos: { productoId: string; cantidad: number }[] = [];

      for (const item of data.items) {
        const producto = productos.find((p) => p.id === item.productoId)!;
        if (producto.stock < item.cantidad) {
          throw new Error(`No hay suficiente stock de "${producto.nombre}".`);
        }
        const oferta = getOfertaActiva(producto.ofertas);
        const precioUnitario = calcularPrecioFinal(producto.precioVenta, oferta);
        subtotal += precioUnitario * item.cantidad;
        pedidoItemsData.push({
          productoId: producto.id,
          cantidad: item.cantidad,
          precioUnitario,
        });
        movimientos.push({ productoId: producto.id, cantidad: item.cantidad });
      }

      // Costo de envío pendiente de definir (ver decisión en Fase 3 — carrito de compras).
      const costoEnvio = 0;
      const direccionCompleta = [data.direccionEnvio, data.ciudad, data.referencia]
        .filter(Boolean)
        .join(", ");

      const pedido = await tx.pedido.create({
        data: {
          userId: session?.user?.id,
          nombreContacto: data.nombreContacto,
          telefonoContacto: data.telefonoContacto,
          emailContacto: data.emailContacto ?? null,
          esInvitado: !session?.user,
          estado: "PENDIENTE",
          subtotal,
          costoEnvio,
          total: subtotal + costoEnvio,
          direccionEnvio: direccionCompleta,
          metodoPago: data.metodoPago,
          items: { createMany: { data: pedidoItemsData } },
        },
      });

      for (const m of movimientos) {
        await tx.producto.update({
          where: { id: m.productoId },
          data: { stock: { decrement: m.cantidad } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: m.productoId,
            tipo: "SALIDA",
            cantidad: m.cantidad,
            motivo: `Venta - Pedido ${pedido.id}`,
          },
        });
      }

      return pedido.id;
    });

    return { ok: true, pedidoId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "No se pudo crear el pedido.";
    return { ok: false, error: message };
  }
}

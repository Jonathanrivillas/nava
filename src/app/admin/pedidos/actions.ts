"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ESTADOS, type Estado } from "@/lib/pedidos";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.rol !== "ADMIN_SOCIO") {
    throw new Error("No autorizado");
  }
}

export async function actualizarEstadoPedido(id: string, nuevoEstado: Estado) {
  await requireAdmin();

  if (!ESTADOS.includes(nuevoEstado)) {
    throw new Error("Estado inválido");
  }

  await prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUniqueOrThrow({
      where: { id },
      include: { items: true },
    });

    const seEstaCancelando = nuevoEstado === "CANCELADO" && pedido.estado !== "CANCELADO";

    await tx.pedido.update({ where: { id }, data: { estado: nuevoEstado } });

    if (seEstaCancelando) {
      for (const item of pedido.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: "ENTRADA",
            cantidad: item.cantidad,
            motivo: `Cancelación - Pedido ${pedido.id}`,
          },
        });
      }
    }
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}

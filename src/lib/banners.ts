import { prisma } from "@/lib/prisma";

export async function getBannersActivos() {
  const ahora = new Date();
  return prisma.banner.findMany({
    where: {
      activo: true,
      OR: [{ fechaInicio: null }, { fechaInicio: { lte: ahora } }],
      AND: [{ OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }] }],
    },
    orderBy: { orden: "asc" },
  });
}

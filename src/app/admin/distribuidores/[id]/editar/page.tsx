import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DistribuidorForm } from "@/components/admin/distribuidor-form";

export const metadata: Metadata = {
  title: "Editar distribuidor — Admin Nava",
};

export default async function EditarDistribuidorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const distribuidor = await prisma.distribuidor.findUnique({ where: { id } });

  if (!distribuidor) notFound();

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Editar distribuidor</h1>
      <DistribuidorForm distribuidor={distribuidor} />
    </div>
  );
}

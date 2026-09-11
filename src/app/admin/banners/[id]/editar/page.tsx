import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = {
  title: "Editar banner — Admin Nava",
};

export default async function EditarBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });

  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Editar banner</h1>
      <BannerForm banner={banner} />
    </div>
  );
}

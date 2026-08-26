import type { Metadata } from "next";
import { BannerForm } from "@/components/admin/banner-form";

export const metadata: Metadata = {
  title: "Nuevo banner — Admin Nava",
};

export default function NuevoBannerPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="font-display text-3xl">Nuevo banner</h1>
      <BannerForm />
    </div>
  );
}

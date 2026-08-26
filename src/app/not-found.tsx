import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="font-display text-3xl italic font-semibold">Nava</div>
      <h1 className="font-display text-4xl">Página no encontrada</h1>
      <p className="max-w-sm text-muted-foreground">
        El enlace que seguiste no existe o el producto ya no está disponible.
      </p>
      <Link href="/catalogo">
        <Button className="h-12 px-7">Ir al catálogo</Button>
      </Link>
    </div>
  );
}

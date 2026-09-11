"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUsuario } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/catalogo";

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const resultado = await loginUsuario(
      String(formData.get("email") ?? ""),
      String(formData.get("password") ?? ""),
    );

    if (!resultado.ok) {
      setError(resultado.error);
      setEnviando(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 lg:px-10">
      <h1 className="mb-2 font-display text-3xl">Iniciar sesión</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href={`/registro?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-primary">
          Regístrate
        </Link>
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="tucorreo@ejemplo.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={enviando} className="mt-2 h-12">
          {enviando ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}

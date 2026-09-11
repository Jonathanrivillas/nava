"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registrarUsuario } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegistroView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/catalogo";

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const resultado = await registrarUsuario({
      nombre: String(formData.get("nombre") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmarPassword: String(formData.get("confirmarPassword") ?? ""),
    });

    if (!resultado.ok) {
      setError(resultado.error);
      setFieldErrors(resultado.fieldErrors ?? {});
      setEnviando(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 lg:px-10">
      <h1 className="mb-2 font-display text-3xl">Crear cuenta</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-primary">
          Inicia sesión
        </Link>
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input id="nombre" name="nombre" placeholder="María Pérez" required />
          {fieldErrors.nombre && <p className="text-xs text-destructive">{fieldErrors.nombre}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="tucorreo@ejemplo.com" required />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="telefono">
            Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input id="telefono" name="telefono" placeholder="300 000 0000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
          {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
          <Input id="confirmarPassword" name="confirmarPassword" type="password" required />
          {fieldErrors.confirmarPassword && (
            <p className="text-xs text-destructive">{fieldErrors.confirmarPassword}</p>
          )}
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={enviando} className="mt-2 h-12">
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}

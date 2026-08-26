"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

const registroSchema = z
  .object({
    nombre: z.string().trim().min(3, "Ingresa tu nombre completo"),
    email: z.email("Correo inválido").trim().toLowerCase(),
    telefono: z.string().trim().optional(),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type RegistroInput = z.infer<typeof registroSchema>;

export type RegistroResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function registrarUsuario(input: RegistroInput): Promise<RegistroResult> {
  const parsed = registroSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisa los datos del formulario.", fieldErrors };
  }

  const data = parsed.data;

  const existente = await prisma.user.findUnique({ where: { email: data.email } });
  if (existente) {
    return {
      ok: false,
      error: "Ya existe una cuenta con este correo.",
      fieldErrors: { email: "Ya existe una cuenta con este correo." },
    };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      telefono: data.telefono || null,
      rol: "CLIENTE",
    },
  });

  try {
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
  } catch {
    // La cuenta se creó igual; si el auto-login falla, el usuario puede entrar manualmente en /login.
  }

  return { ok: true };
}

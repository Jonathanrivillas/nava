"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginUsuario(email: string, password: string): Promise<LoginResult> {
  try {
    await signIn("credentials", { email: email.toLowerCase(), password, redirect: false });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}

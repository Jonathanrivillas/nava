import type { Metadata } from "next";
import { LoginView } from "./login-view";

export const metadata: Metadata = {
  title: "Iniciar sesión — Nava",
};

export default function LoginPage() {
  return <LoginView />;
}

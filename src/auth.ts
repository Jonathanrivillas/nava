import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.activo) return null;

        const passwordValida = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValida) return null;

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          rol: user.rol,
        };
      },
    }),
  ],
});

import type { NextAuthConfig } from "next-auth";

// Config "edge-safe": sin el provider de Credentials (que necesita Prisma/pg,
// no disponible en el runtime Edge del middleware). El resto de la app usa
// auth.ts, que extiende esta config añadiendo el provider real.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      if (!auth?.user) return false;
      if (auth.user.rol !== "ADMIN_SOCIO") {
        return Response.redirect(new URL("/catalogo", request.nextUrl.origin));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = (user as { rol: string }).rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

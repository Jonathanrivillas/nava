import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // El middleware ya protege /admin/*; esta es una segunda verificación por si acaso.
  if (!session?.user || session.user.rol !== "ADMIN_SOCIO") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-end gap-4 border-b border-border px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {session.user.name?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/catalogo" });
            }}
          >
            <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Cerrar sesión
            </button>
          </form>
        </div>
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </div>
  );
}

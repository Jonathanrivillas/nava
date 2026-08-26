import Link from "next/link";
import { auth, signOut } from "@/auth";
import { UserIcon } from "@/components/storefront/icons";

export async function UserMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link href="/login" aria-label="Iniciar sesión" className="flex items-center text-foreground">
        <UserIcon />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm font-medium sm:inline">{session.user.name}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/catalogo" });
        }}
      >
        <button
          type="submit"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="flex items-center text-foreground"
        >
          <UserIcon />
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { auth } from "@/auth";
import { UserIcon } from "@/components/storefront/icons";
import { UserMenuDropdown } from "@/components/storefront/user-menu-dropdown";

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
    <UserMenuDropdown
      nombre={session.user.name ?? ""}
      esAdmin={session.user.rol === "ADMIN_SOCIO"}
    />
  );
}

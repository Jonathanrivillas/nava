"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cerrarSesion } from "@/lib/auth-actions";
import { LayoutDashboardIcon, ShoppingBagIcon, LogOutIcon, UserIcon } from "@/components/storefront/icons";

export function UserMenuDropdown({ nombre, esAdmin }: { nombre: string; esAdmin: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Cuenta"
        className="flex items-center text-foreground outline-none"
      >
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{nombre}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {esAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <LayoutDashboardIcon width={15} height={15} />
            Panel administrativo
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem render={<Link href="/mis-pedidos" />}>
            <ShoppingBagIcon width={15} height={15} />
            Mis pedidos
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => cerrarSesion()}>
          <LogOutIcon width={15} height={15} />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

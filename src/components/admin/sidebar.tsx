"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagIcon,
  ImagePlaceholderIcon,
  ShoppingBagIcon,
  UsersIcon,
} from "@/components/storefront/icons";

const ITEMS = [
  { label: "Estadísticas", href: null, icon: LayoutDashboardIcon },
  { label: "Productos", href: "/admin/productos", icon: PackageIcon },
  { label: "Precios y ofertas", href: "/admin/ofertas", icon: TagIcon },
  { label: "Banners", href: null, icon: ImagePlaceholderIcon },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBagIcon },
  { label: "Distribuidores e inventario", href: null, icon: UsersIcon },
  { label: "Usuarios y roles", href: null, icon: UsersIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground">
      <div className="px-3 pb-8 pt-2 font-display text-2xl italic">
        Nava <span className="font-sans text-xs not-italic text-sidebar-foreground/60">Admin</span>
      </div>

      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const activo = item.href && pathname.startsWith(item.href);
          const Icon = item.icon;

          if (!item.href) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/40"
                title="Próximamente"
              >
                <Icon width={18} height={18} />
                {item.label}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                activo
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent"
              }`}
            >
              <Icon width={18} height={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

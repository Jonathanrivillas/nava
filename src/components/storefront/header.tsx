import Link from "next/link";
import { SearchIcon, HeartIcon } from "@/components/storefront/icons";
import { CartBadge } from "@/components/cart/cart-badge";
import { UserMenu } from "@/components/storefront/user-menu";

export async function StorefrontHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="font-display text-3xl italic font-semibold text-foreground"
        >
          Nava
        </Link>

        <form
          action="/catalogo"
          method="get"
          className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-muted-foreground focus-within:border-primary"
        >
          <SearchIcon width={16} height={16} />
          <input
            type="text"
            name="q"
            placeholder="Buscar producto..."
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="flex items-center gap-5 text-foreground">
          <UserMenu />
          <HeartIcon />
          <CartBadge />
        </div>
      </div>
    </header>
  );
}

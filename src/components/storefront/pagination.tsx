import Link from "next/link";

export function CatalogoPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    else params.delete("page");
    const qs = params.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-[13px] font-semibold ${
            p === page
              ? "bg-primary text-primary-foreground"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}

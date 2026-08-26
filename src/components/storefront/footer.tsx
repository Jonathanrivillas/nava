import { WhatsappIcon } from "@/components/storefront/icons";

const WHATSAPP_URL = "https://wa.me/573106490790";

export function StorefrontFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center lg:px-10">
        <p className="text-xs text-muted-foreground">© 2026 Nava. Todos los derechos reservados.</p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-[oklch(50%_0.1_150)] px-4 py-2 text-xs font-semibold text-white"
        >
          <WhatsappIcon width={14} height={14} />
          Escríbenos por WhatsApp
        </a>
      </div>
    </footer>
  );
}

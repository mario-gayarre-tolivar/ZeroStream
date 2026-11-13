import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface py-12 text-sm text-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Aviso legal (DMCA)</span>
            </div>
            <p className="leading-relaxed">
              ZeroStream indexa metadatos y no aloja ni distribuye vídeo. Todo el contenido viene de
              servicios externos independientes, a través de iframes públicos.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-foreground">
            <Link href="/peliculas" className="hover:text-accent transition-colors">
              Películas
            </Link>
            <Link href="/series" className="hover:text-accent transition-colors">
              Series
            </Link>
            <Link href="/anime" className="hover:text-accent transition-colors">
              Anime
            </Link>
            <Link href="/mi-lista" className="hover:text-accent transition-colors">
              Mi lista
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-faint">
          <p>© {new Date().getFullYear()} ZeroStream.</p>
        </div>
      </div>
    </footer>
  );
}

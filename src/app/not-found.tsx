import Link from "next/link";
import { Film, Clapperboard, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[460px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-poster bg-surface-active text-accent border border-border">
        <HelpCircle className="h-7 w-7" aria-hidden="true" />
      </div>

      <span className="mt-5 rounded-poster bg-surface-active px-2.5 py-0.5 font-mono text-xs font-semibold text-accent">
        404
      </span>

      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Contenido no encontrado
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted">
        El título, capítulo o sección que buscas no existe o fue retirado de las fuentes externas.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-poster bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Inicio
        </Link>

        <Link
          href="/peliculas"
          className="flex items-center gap-2 rounded-poster border border-border-active bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          <Film className="h-4 w-4" aria-hidden="true" />
          Películas
        </Link>

        <Link
          href="/anime"
          className="flex items-center gap-2 rounded-poster border border-border-active bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Anime
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Film, Sparkles, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[460px] w-full flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-active text-accent border border-border shadow-sm">
        <HelpCircle className="h-7 w-7" />
      </div>

      <span className="mt-5 rounded bg-accent/15 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
        404
      </span>

      <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        Contenido no encontrado
      </h1>

      <p className="mt-2 max-w-md text-xs text-zinc-400">
        El título, capítulo o sección que buscas no existe o fue retirado de las fuentes externas indexadas.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>

        <Link
          href="/peliculas"
          className="flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Film className="h-4 w-4" />
          Películas
        </Link>

        <Link
          href="/anime"
          className="flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Sparkles className="h-4 w-4" />
          Anime
        </Link>
      </div>
    </div>
  );
}

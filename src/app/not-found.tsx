import Link from "next/link";
import { Film, Sparkles, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-active text-accent border border-border shadow-lg">
        <HelpCircle className="h-8 w-8" />
      </div>

      <span className="mt-6 rounded-md bg-accent/15 px-3 py-1 font-mono text-xs font-bold text-accent">
        ERROR 404
      </span>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Contenido No Encontrado
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        El título, capítulo o sección que intentas visualizar no existe o fue retirado de las
        fuentes externas indexadas.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-accent-hover"
        >
          <Home className="h-4 w-4" />
          Inicio
        </Link>

        <Link
          href="/peliculas"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Film className="h-4 w-4" />
          Películas
        </Link>

        <Link
          href="/anime"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Sparkles className="h-4 w-4" />
          Anime
        </Link>
      </div>
    </div>
  );
}

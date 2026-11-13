import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-surface/30 py-10 text-xs text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 font-medium text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Aviso legal y deslinde de responsabilidad (DMCA)</span>
            </div>
            <p className="leading-relaxed text-zinc-400">
              ZeroStream opera como indexador y catálogo de metadatos bajo una arquitectura
              de costo cero (Zero-Storage). La plataforma no almacena ni distribuye archivos multimedia
              en servidores propios. Todo el contenido es provisto por servicios externos independientes
              a través de iframes públicos.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-zinc-400">
            <Link href="/peliculas" className="hover:text-zinc-200 transition-colors">
              Películas
            </Link>
            <Link href="/series" className="hover:text-zinc-200 transition-colors">
              Series
            </Link>
            <Link href="/anime" className="hover:text-zinc-200 transition-colors">
              Anime
            </Link>
            <Link href="/mi-lista" className="hover:text-zinc-200 transition-colors">
              Mi lista
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/30 pt-6 text-center text-zinc-600">
          <p>© {new Date().getFullYear()} ZeroStream. Exploración multimedia sin almacenamiento.</p>
        </div>
      </div>
    </footer>
  );
}

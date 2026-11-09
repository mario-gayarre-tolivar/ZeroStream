import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-surface/40 py-10 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-300">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Aviso Legal y Deslinde de Responsabilidad (DMCA)</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              ZeroStream opera como un indexador y catálogo de metadatos bajo una arquitectura
              de costo cero (Zero-Storage). Esta plataforma no almacena, transmite ni sube ningún
              archivo multimedia en servidores propios. Todo el contenido reproducido proviene de
              servicios de terceros independientes mediante iframes públicos.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <Link href="/peliculas" className="hover:text-slate-200 transition-colors">
              Películas
            </Link>
            <Link href="/series" className="hover:text-slate-200 transition-colors">
              Series
            </Link>
            <Link href="/anime" className="hover:text-slate-200 transition-colors">
              Anime
            </Link>
            <Link href="/mi-lista" className="hover:text-slate-200 transition-colors">
              Mi Lista
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6 text-center text-slate-600">
          <p>© {new Date().getFullYear()} ZeroStream. Plataforma de exploración multimedia.</p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[480px] w-full flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Error al cargar el contenido
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        No se pudo completar la conexión con los servidores de metadatos o streams. Esto puede
        deberse a intermitencias temporales en las fuentes externas.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-lg border border-border bg-surface-active/50 px-3 py-1.5 font-mono text-[11px] text-slate-400">
          {error.message}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-accent/25"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar conexión
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Home className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

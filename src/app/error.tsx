"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

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
    <div className="flex min-h-[460px] w-full flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20 shadow-sm">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h1 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl">
        Error al cargar el contenido
      </h1>

      <p className="mt-2 max-w-md text-xs text-zinc-400">
        No se pudo completar la conexión con los servidores de metadatos o streams. Esto puede deberse a intermitencias temporales en las fuentes externas.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded border border-border bg-surface px-3 py-1.5 font-mono text-[11px] text-zinc-400">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-accent-hover"
        >
          <RotateCcw className="h-4 w-4" />
          Reintentar conexión
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-surface-hover hover:text-white"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

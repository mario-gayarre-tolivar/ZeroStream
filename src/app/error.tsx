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
    <div className="flex min-h-[460px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-poster bg-accent-seat/15 text-accent-danger-text border border-accent-seat/30">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>

      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Error al cargar la página
      </h1>

      <p className="mt-2 max-w-md text-sm text-muted">
        No se pudo cargar esta página. Comprueba tu conexión e inténtalo de nuevo.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-poster border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-poster bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-poster border border-border-active bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

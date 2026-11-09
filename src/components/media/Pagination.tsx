"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";

interface PaginationProps {
  currentPage: number;
  hasMore?: boolean;
}

export function Pagination({ currentPage, hasMore = true }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const pagesToShow = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = startPage + 4;

  for (let p = startPage; p <= endPage; p++) {
    pagesToShow.push(p);
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Paginación de catálogo"
    >
      {/* Botón Anterior */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-hover hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Números de Página */}
      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="h-8 w-8 rounded-lg border border-border bg-surface text-xs font-medium text-slate-300 hover:bg-surface-hover hover:text-white"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-slate-600">...</span>}
          </>
        )}

        {pagesToShow.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              disabled={isPending}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                isCurrent
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-surface text-slate-300 hover:bg-surface-hover hover:text-white"
              }`}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasMore || isPending}
        className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-hover hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

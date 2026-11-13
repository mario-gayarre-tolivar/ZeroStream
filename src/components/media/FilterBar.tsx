"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useTransition } from "react";

interface FilterBarProps {
  genres: string[];
  currentGenre?: string;
}

export function FilterBar({ genres, currentGenre }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const selectedGenre = currentGenre || searchParams.get("genre") || "";
  const currentSearch = searchParams.get("q") || "";

  const handleGenreClick = (genre: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedGenre.toLowerCase() === genre.toLowerCase()) {
      params.delete("genre");
    } else {
      params.set("genre", genre);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Search tag indicator if active */}
      {currentSearch && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Resultados para:</span>
          <span className="rounded-poster bg-surface-active px-2.5 py-1 font-semibold text-accent">
            &ldquo;{currentSearch}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("q");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Quitar búsqueda
          </button>
        </div>
      )}

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={clearAllFilters}
          className={`shrink-0 rounded-chip px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !selectedGenre
              ? "bg-accent text-accent-ink font-semibold"
              : "border border-border-active bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          Todos
        </button>

        {genres.map((genre) => {
          const isSelected = selectedGenre.toLowerCase() === genre.toLowerCase();
          return (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreClick(genre)}
              className={`shrink-0 rounded-chip px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-accent text-accent-ink font-semibold"
                  : "border border-border-active bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { useTransition } from "react";

interface FilterBarProps {
  genres: string[];
  currentGenre?: string;
}

export function FilterBar({ genres, currentGenre }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedGenre = currentGenre || searchParams.get("genre") || "";
  const currentSearch = searchParams.get("q") || "";

  const handleGenreClick = (genre: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedGenre === genre) {
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
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>Resultados para:</span>
          <span className="rounded-md bg-surface-active px-2.5 py-1 font-semibold text-accent">
            "{currentSearch}"
          </span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("q");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Quitar búsqueda
          </button>
        </div>
      )}

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={clearAllFilters}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !selectedGenre
              ? "bg-accent text-white"
              : "border border-border bg-surface text-slate-400 hover:bg-surface-hover hover:text-white"
          }`}
        >
          Todos
        </button>

        {genres.map((genre) => {
          const isSelected = selectedGenre.toLowerCase() === genre.toLowerCase();
          return (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-slate-400 hover:bg-surface-hover hover:text-white"
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

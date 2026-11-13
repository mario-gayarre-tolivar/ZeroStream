"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Star, Film, Tv, Clapperboard, ChevronRight } from "lucide-react";
import { MediaItem } from "@/types";

interface LiveSearchProps {
  onSelect?: () => void;
  isMobile?: boolean;
}

interface SearchResponse {
  query: string;
  totalResults: number;
  movies: MediaItem[];
  series: MediaItem[];
  anime: MediaItem[];
}

export function LiveSearch({ onSelect, isMobile = false }: LiveSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce de 300 ms con AbortController para cancelar peticiones anteriores
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err: unknown) {
        console.error("Error al buscar en vivo:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(false);
    if (onSelect) onSelect();
    router.push(`/peliculas?q=${encodeURIComponent(query.trim())}`);
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setQuery("");
    if (onSelect) onSelect();
  };

  const renderGroup = (
    title: string,
    items: MediaItem[],
    icon: React.ReactNode,
    categoryUrl: string
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="border-b border-border py-2 last:border-b-0">
        <div className="flex items-center justify-between px-3 py-1.5 text-sm font-semibold text-muted">
          <div className="flex items-center gap-1.5">
            {icon}
            <span>{title}</span>
          </div>
          <Link
            href={`${categoryUrl}?q=${encodeURIComponent(query.trim())}`}
            onClick={handleItemClick}
            className="flex items-center gap-0.5 text-xs font-normal text-accent hover:underline"
          >
            Ver más <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          {items.slice(0, 4).map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/ver/${item.type}/${item.id}`}
              onClick={handleItemClick}
              className="flex items-center gap-3 rounded-poster px-3 py-1.5 transition-colors hover:bg-surface-hover"
            >
              <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded-poster bg-surface-active">
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-faint">
                    N/A
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="text-xs text-faint">
                  {item.releaseDate ? item.releaseDate.slice(0, 4) : "—"}
                </span>
              </div>

              {item.voteAverage > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-accent">
                  <Star className="h-3 w-3 fill-accent" />
                  <span>{item.voteAverage}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? "w-full" : "w-64 lg:w-80"}`}
    >
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar anime, película, serie..."
          aria-label="Buscar películas, series o anime"
          className="w-full rounded-poster border border-border-active bg-surface py-1.5 pl-8 pr-8 text-sm text-foreground placeholder-faint transition-colors focus:border-accent focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
        />

        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint" />

        {isLoading ? (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-accent" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {/* Resultados flotantes */}
      {isOpen && results && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[420px] overflow-y-auto rounded-poster border border-border-active bg-surface p-1 shadow-lg">
          {results.totalResults === 0 ? (
            <div className="p-4 text-center text-sm text-muted">
              No se encontraron coincidencias para &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {renderGroup("Películas", results.movies, <Film className="h-3.5 w-3.5 text-accent" />, "/peliculas")}
              {renderGroup("Series", results.series, <Tv className="h-3.5 w-3.5 text-accent" />, "/series")}
              {renderGroup("Anime", results.anime, <Clapperboard className="h-3.5 w-3.5 text-accent" />, "/anime")}
            </>
          )}
        </div>
      )}
    </div>
  );
}

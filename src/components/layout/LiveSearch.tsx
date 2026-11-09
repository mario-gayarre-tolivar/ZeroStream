"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Star, Film, Tv, Sparkles, ChevronRight } from "lucide-react";
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

  // Debounce de 300 ms para no saturar peticiones
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
      } catch (err) {
        console.error("Error al buscar en vivo:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
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
      <div className="flex flex-col gap-1.5 py-2">
        <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            {icon}
            <span>{title}</span>
          </div>
          <Link
            href={`${categoryUrl}?q=${encodeURIComponent(query)}`}
            onClick={handleItemClick}
            className="text-[10px] lowercase text-accent hover:underline"
          >
            ver más
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={`/ver/${item.type}/${item.id}`}
              onClick={handleItemClick}
              className="flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-active"
            >
              <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded bg-surface-active">
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-500">
                    N/A
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="line-clamp-1 text-xs font-semibold text-slate-100 hover:text-accent">
                  {item.title}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.releaseDate ? item.releaseDate.slice(0, 4) : "—"}</span>
                  {item.voteAverage > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-amber-400" />
                      {item.voteAverage}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const hasAnyResults =
    results &&
    (results.movies.length > 0 || results.series.length > 0 || results.anime.length > 0);

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? "w-full" : "w-64 md:w-80"}`}
      role="search"
    >
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          placeholder="Buscar anime, película, serie..."
          value={query}
          onFocus={() => {
            if (results && results.totalResults > 0) setIsOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-9 py-1.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-accent focus:bg-surface-hover focus:outline-none"
        />

        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setIsOpen(false);
              }}
              className="text-slate-500 hover:text-slate-300"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Floating Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[440px] overflow-y-auto rounded-xl border border-border bg-surface/95 p-2 shadow-2xl backdrop-blur-md">
          {isLoading && !results && (
            <div className="flex items-center justify-center py-8 text-xs text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
              Buscando coincidencias...
            </div>
          )}

          {!isLoading && !hasAnyResults && (
            <div className="py-6 text-center text-xs text-slate-400">
              <p>No se encontraron resultados para "{query}"</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Prueba con otro título en español, inglés o nombre original.
              </p>
            </div>
          )}

          {hasAnyResults && (
            <div className="divide-y divide-border/60">
              {renderGroup(
                "Películas",
                results!.movies,
                <Film className="h-3.5 w-3.5 text-accent" />,
                "/peliculas"
              )}
              {renderGroup(
                "Series de TV",
                results!.series,
                <Tv className="h-3.5 w-3.5 text-accent" />,
                "/series"
              )}
              {renderGroup(
                "Anime",
                results!.anime,
                <Sparkles className="h-3.5 w-3.5 text-accent" />,
                "/anime"
              )}

              {/* Footer CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-accent hover:bg-surface-active"
                >
                  <span>Ver catálogo completo con "{query}"</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

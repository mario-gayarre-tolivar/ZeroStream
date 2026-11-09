"use client";

import { useState, useEffect } from "react";
import { MediaItem, MediaType } from "@/types";
import { MediaCard } from "./MediaCard";
import { Pagination } from "./Pagination";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface LoadMoreCatalogProps {
  initialItems: MediaItem[];
  type: MediaType;
  currentPage: number;
  genre?: string;
  query?: string;
}

export function LoadMoreCatalog({
  initialItems,
  type,
  currentPage,
  genre,
  query,
}: LoadMoreCatalogProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [nextPage, setNextPage] = useState(currentPage + 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 6);

  // Sincronizar si cambian los parámetros de página/filtro desde el servidor
  useEffect(() => {
    setItems(initialItems);
    setNextPage(currentPage + 1);
    setHasMore(initialItems.length >= 6);
  }, [initialItems, currentPage, genre, query]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      if (genre) params.set("genre", genre);
      if (query) params.set("q", query);

      const res = await fetch(`/api/catalog/${type}?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const newResults: MediaItem[] = json.results || [];

        if (newResults.length === 0) {
          setHasMore(false);
        } else {
          // Filtrar duplicados por si se solapan
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => `${i.type}-${i.id}`));
            const uniqueAdditions = newResults.filter(
              (i) => !existingIds.has(`${i.type}-${i.id}`)
            );
            return [...prev, ...uniqueAdditions];
          });
          setNextPage((prev) => prev + 1);
          if (newResults.length < 6) {
            setHasMore(false);
          }
        }
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Error loading more items:", e);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Grid de títulos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MediaCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>

      {/* Botón de Cargar Más (Carga Dinámica sin recarga) */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:border-border-active hover:bg-surface-hover hover:text-white disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Cargando más títulos...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 text-accent" />
                <span>Cargar más títulos dinámicamente</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Paginación Numérica por URL para navegación directa */}
      <Pagination currentPage={currentPage} hasMore={hasMore} />
    </div>
  );
}

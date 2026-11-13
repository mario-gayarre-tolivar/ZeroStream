"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WatchHistoryItem } from "@/types";
import { getFavorites, getWatchHistory } from "@/services/history";
import { Bookmark, Clock, Trash2 } from "lucide-react";

export default function MyListPage() {
  const [activeTab, setActiveTab] = useState<"favorites" | "history">("favorites");
  const [favorites, setFavorites] = useState<WatchHistoryItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    setHistory(getWatchHistory());
  }, []);

  const handleClearHistory = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sz_watch_history_v1");
      setHistory([]);
    }
  };

  const currentItems = activeTab === "favorites" ? favorites : history;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Mi biblioteca personal
        </h1>
        <p className="text-sm text-muted">
          Tus contenidos guardados e historial de episodios reanudables persistidos de forma segura en tu navegador.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 rounded-poster px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "favorites"
                ? "bg-accent text-accent-ink"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Favoritos ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-poster px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-accent text-accent-ink"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Historial de reproducción ({history.length})
          </button>
        </div>

        {activeTab === "history" && history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-accent-danger-text hover:underline transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Limpiar historial
          </button>
        )}
      </div>

      {/* Grid of Items */}
      {currentItems.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-poster border border-dashed border-border-active bg-surface p-8 text-center">
          {activeTab === "favorites" ? (
            <>
              <Bookmark className="mb-3 h-10 w-10 text-faint" aria-hidden="true" />
              <p className="font-semibold text-foreground">No tienes contenidos en favoritos</p>
              <p className="mt-1 text-xs text-muted">
                Guarda series, animes o películas haciendo clic en el marcador de cualquier tarjeta.
              </p>
            </>
          ) : (
            <>
              <Clock className="mb-3 h-10 w-10 text-faint" aria-hidden="true" />
              <p className="font-semibold text-foreground">Sin historial de reproducción</p>
              <p className="mt-1 text-xs text-muted">
                Los capítulos y películas que reproduzcas aparecerán automáticamente aquí para reanudarlos.
              </p>
            </>
          )}

          <Link
            href="/"
            className="mt-5 rounded-poster bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {currentItems.map((item) => {
            let linkUrl = `/ver/${item.type}/${item.id}`;
            if (item.season && item.episode) {
              linkUrl += `?s=${item.season}&e=${item.episode}`;
            }

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="group relative flex flex-col overflow-hidden rounded-poster border border-border bg-surface transition-colors hover:border-border-active"
              >
                <Link href={linkUrl} className="relative block aspect-[2/3] w-full bg-surface-active overflow-hidden">
                  {item.posterPath ? (
                    <Image
                      src={item.posterPath}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-faint">
                      Sin imagen
                    </div>
                  )}

                  <span className="absolute left-2 top-2 rounded-poster bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                    {item.type}
                  </span>
                </Link>

                <div className="p-3">
                  <Link href={linkUrl}>
                    <h3 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  {item.episodeTitle ? (
                    <span className="mt-1 block text-xs font-medium text-accent">
                      {item.episodeTitle}
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-muted">
                      Listo para ver
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

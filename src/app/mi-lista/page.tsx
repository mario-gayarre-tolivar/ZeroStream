"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WatchHistoryItem } from "@/types";
import { getFavorites, getWatchHistory } from "@/services/history";
import { Bookmark, Clock, Trash2, Play } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Mi Biblioteca Personal
        </h1>
        <p className="text-sm text-slate-400">
          Tus contenidos guardados e historial de episodios reanudables persistidos de forma segura en tu navegador.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "favorites"
                ? "bg-accent text-white"
                : "text-slate-400 hover:bg-surface-hover hover:text-white"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            Favoritos ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-accent text-white"
                : "text-slate-400 hover:bg-surface-hover hover:text-white"
            }`}
          >
            <Clock className="h-4 w-4" />
            Historial de Reproducción ({history.length})
          </button>
        </div>

        {activeTab === "history" && history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar historial
          </button>
        )}
      </div>

      {/* Grid of Items */}
      {currentItems.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center">
          {activeTab === "favorites" ? (
            <>
              <Bookmark className="mb-3 h-10 w-10 text-slate-600" />
              <p className="font-semibold text-slate-300">No tienes contenidos en favoritos</p>
              <p className="mt-1 text-xs text-slate-500">
                Guarda series, animes o películas haciendo clic en el icono del marcador de cualquier tarjeta.
              </p>
            </>
          ) : (
            <>
              <Clock className="mb-3 h-10 w-10 text-slate-600" />
              <p className="font-semibold text-slate-300">Sin historial de reproducción</p>
              <p className="mt-1 text-xs text-slate-500">
                Los capítulos y películas que reproduzcas aparecerán automáticamente aquí para reanudarlos.
              </p>
            </>
          )}

          <Link
            href="/"
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            Explorar Catálogo
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
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-border-active"
              >
                <Link href={linkUrl} className="relative block aspect-[2/3] w-full bg-surface-active overflow-hidden">
                  {item.posterPath ? (
                    <Image
                      src={item.posterPath}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                      Sin Imagen
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow">
                      <Play className="h-4 w-4 fill-white pl-0.5" />
                    </span>
                  </div>

                  <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-200">
                    {item.type.toUpperCase()}
                  </span>
                </Link>

                <div className="p-3">
                  <Link href={linkUrl}>
                    <h3 className="line-clamp-1 text-xs font-semibold text-slate-100 group-hover:text-accent">
                      {item.title}
                    </h3>
                  </Link>

                  {item.episodeTitle ? (
                    <span className="mt-1 block text-[11px] font-medium text-accent">
                      {item.episodeTitle}
                    </span>
                  ) : (
                    <span className="mt-1 block text-[11px] text-slate-500">
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

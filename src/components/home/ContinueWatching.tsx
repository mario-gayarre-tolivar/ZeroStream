"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WatchHistoryItem } from "@/types";
import { getWatchHistory } from "@/services/history";
import { Play, Clock } from "lucide-react";

export function ContinueWatching() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="mb-12 w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-bold tracking-tight text-white">Continuar Viendo</h2>
        </div>
        <Link
          href="/mi-lista"
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          Ver todo el historial →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {history.slice(0, 8).map((item) => {
          let resumeUrl = `/ver/${item.type}/${item.id}`;
          if (item.season && item.episode) {
            resumeUrl += `?s=${item.season}&e=${item.episode}`;
          }

          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={resumeUrl}
              className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-border-active"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-active">
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                    Sin Miniatura
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow">
                    <Play className="h-4 w-4 fill-white pl-0.5" />
                  </span>
                </div>
              </div>

              <div className="p-2.5">
                <h3 className="line-clamp-1 text-xs font-semibold text-slate-100 group-hover:text-accent">
                  {item.title}
                </h3>
                <span className="mt-1 block text-[11px] text-accent font-medium">
                  {item.episodeTitle || "Reanudar"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

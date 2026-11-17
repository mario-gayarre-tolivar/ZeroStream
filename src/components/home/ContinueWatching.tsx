"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { WatchHistoryItem } from "@/types";
import { getWatchHistory } from "@/client/history";
import { Clock } from "lucide-react";

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
          <Clock className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Continuar viendo
          </h2>
        </div>
        <Link
          href="/mi-lista"
          className="text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Ver historial completo
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
              className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-poster border border-border bg-surface transition-colors hover:border-border-active"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-active">
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-faint">
                    Sin miniatura
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <span className="mt-1 block text-xs text-accent font-medium">
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

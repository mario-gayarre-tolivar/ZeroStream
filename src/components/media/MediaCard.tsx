"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bookmark, Star, Play } from "lucide-react";
import { MediaItem } from "@/types";
import { isFavorite, toggleFavorite } from "@/services/history";

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(item.id, item.type));
  }, [item.id, item.type]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite({
      id: item.id,
      title: item.title,
      type: item.type,
      posterPath: item.posterPath,
    });
    setFavorite(newState);
  };

  const typeLabels: Record<string, string> = {
    movie: "Película",
    tv: "Serie",
    anime: "Anime",
  };

  const detailUrl = `/ver/${item.type}/${item.id}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-border-active hover:shadow-xl hover:shadow-black/60">
      <Link href={detailUrl} className="relative block aspect-[2/3] w-full overflow-hidden bg-surface-active">
        {item.posterPath ? (
          <Image
            src={item.posterPath}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
            Sin imagen
          </div>
        )}

        {/* Overlay Hover Icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-background shadow-lg">
            <Play className="h-5 w-5 fill-background pl-0.5" />
          </span>
        </div>

        {/* Media Type Badge */}
        <span className="absolute left-2.5 top-2.5 rounded bg-black/75 px-2 py-0.5 text-[11px] font-medium text-zinc-200 backdrop-blur-xs">
          {typeLabels[item.type] || item.type}
        </span>

        {/* Favorite Quick Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded backdrop-blur-xs transition-colors ${
            favorite
              ? "bg-accent text-background"
              : "bg-black/60 text-zinc-300 hover:bg-black/85 hover:text-white"
          }`}
          aria-label={favorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${favorite ? "fill-background" : ""}`} />
        </button>
      </Link>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={detailUrl} className="focus:outline-none">
          <h3 className="line-clamp-1 text-sm font-medium text-zinc-100 transition-colors group-hover:text-accent">
            {item.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
          <span>{item.releaseDate ? item.releaseDate.slice(0, 4) : "—"}</span>

          {item.voteAverage > 0 && (
            <div className="flex items-center gap-1 font-medium text-accent">
              <Star className="h-3 w-3 fill-accent" />
              <span>{item.voteAverage}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

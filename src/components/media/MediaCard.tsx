"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bookmark, Star } from "lucide-react";
import { MediaItem } from "@/types";
import { isFavorite, toggleFavorite } from "@/client/history";

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
    <article className="group relative flex flex-col overflow-hidden rounded-poster border border-border bg-surface transition-colors duration-200 hover:border-border-active focus-within:border-accent">
      <Link href={detailUrl} className="relative block aspect-[2/3] w-full overflow-hidden bg-surface-active">
        {item.posterPath ? (
          <Image
            src={item.posterPath}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-faint">
            Sin imagen
          </div>
        )}

        {/* Media Type Badge */}
        <span className="absolute left-2.5 top-2.5 rounded-poster bg-background px-2 py-0.5 text-xs font-medium text-foreground">
          {typeLabels[item.type] || item.type}
        </span>

        {/* Favorite Quick Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-poster transition-colors ${
            favorite
              ? "bg-accent text-accent-ink"
              : "bg-background text-foreground hover:bg-surface-hover"
          }`}
          aria-label={favorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
        >
          <Bookmark aria-hidden="true" className={`h-3.5 w-3.5 ${favorite ? "fill-accent-ink" : ""}`} />
        </button>
      </Link>

      {/* Info Section */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={detailUrl} className="focus:outline-none">
          <h3 className="line-clamp-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-accent">
            {item.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between text-sm text-muted tabular-nums">
          <span>{item.releaseDate ? item.releaseDate.slice(0, 4) : "—"}</span>

          {item.voteAverage > 0 && (
            <div className="flex items-center gap-1 font-medium text-accent">
              <Star aria-hidden="true" className="h-3 w-3 fill-accent" />
              <span>{item.voteAverage}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

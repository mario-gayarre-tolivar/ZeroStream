"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MediaItem } from "@/types";
import { Play, Bookmark, Star, Clapperboard } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/services/history";

interface HeroBannerProps {
  item: MediaItem;
}

export function HeroBanner({ item }: HeroBannerProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(item.id, item.type));
  }, [item.id, item.type]);

  const handleToggle = () => {
    const next = toggleFavorite({
      id: item.id,
      title: item.title,
      type: item.type,
      posterPath: item.posterPath,
    });
    setFavorite(next);
  };

  const playUrl = `/ver/${item.type}/${item.id}`;

  return (
    <section className="relative mb-12 w-full overflow-hidden rounded-poster border border-border bg-surface">
      {/* Background Backdrop Image */}
      <div className="relative h-[380px] sm:h-[460px] md:h-[500px] w-full">
        {item.backdropPath ? (
          <Image
            src={item.backdropPath}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-surface-active" />
        )}

        {/* Single functional scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 rounded-poster bg-accent px-2.5 py-1 font-semibold text-accent-ink">
              <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
              En cartelera hoy
            </span>

            {item.voteAverage > 0 && (
              <span className="flex items-center gap-1 font-medium text-accent tabular-nums">
                <Star className="h-3.5 w-3.5 fill-accent" aria-hidden="true" />
                {item.voteAverage} / 10
              </span>
            )}

            {item.releaseDate && (
              <span className="text-muted font-medium">{item.releaseDate.slice(0, 4)}</span>
            )}

            {item.genres.length > 0 && (
              <span className="hidden sm:inline-block text-muted">
                {item.genres.slice(0, 3).join(" • ")}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {item.title}
          </h1>

          {/* Synopsis */}
          <p className="line-clamp-3 text-sm sm:text-base leading-relaxed text-muted">
            {item.overview}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={playUrl}
              className="flex items-center gap-2 rounded-poster bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
            >
              <Play className="h-4 w-4 fill-accent-ink" aria-hidden="true" />
              Ver ahora
            </Link>

            <button
              type="button"
              onClick={handleToggle}
              className={`flex items-center gap-2 rounded-poster border border-border-active px-5 py-3 text-sm font-medium transition-colors ${
                favorite
                  ? "bg-surface-active text-accent border-accent"
                  : "bg-surface text-foreground hover:bg-surface-hover"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${favorite ? "fill-accent" : ""}`} aria-hidden="true" />
              {favorite ? "En mi lista" : "Guardar en mi lista"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

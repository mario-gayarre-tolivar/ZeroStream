"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MediaItem } from "@/types";
import { Play, Bookmark, Star, Sparkles } from "lucide-react";
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
    <section className="relative mb-12 w-full overflow-hidden rounded-2xl border border-border bg-surface">
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

        {/* Cinematic dark gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-3/4" />
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 font-semibold text-white shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Destacado Hoy
            </span>

            {item.voteAverage > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {item.voteAverage} / 10
              </span>
            )}

            {item.releaseDate && (
              <span className="text-slate-300 font-medium">{item.releaseDate.slice(0, 4)}</span>
            )}

            {item.genres.length > 0 && (
              <span className="hidden sm:inline-block text-slate-400">
                {item.genres.slice(0, 3).join(" • ")}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            {item.title}
          </h1>

          {/* Synopsis */}
          <p className="line-clamp-3 text-sm sm:text-base leading-relaxed text-slate-300">
            {item.overview}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={playUrl}
              className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-accent/40"
            >
              <Play className="h-4 w-4 fill-white" />
              Ver Ahora
            </Link>

            <button
              type="button"
              onClick={handleToggle}
              className={`flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium transition-colors ${
                favorite
                  ? "bg-surface-active text-accent border-accent"
                  : "bg-surface/80 text-slate-200 hover:bg-surface-hover hover:text-white"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${favorite ? "fill-accent" : ""}`} />
              {favorite ? "En Mi Lista" : "Guardar en Mi Lista"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

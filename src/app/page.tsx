import Link from "next/link";
import { getTrendingMedia } from "@/services/tmdb";
import { getTrendingAnime } from "@/services/anilist";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Film, Tv, Sparkles, ChevronRight } from "lucide-react";

export const revalidate = 3600; // Cache 1 hora

export default async function HomePage() {
  // Parallel data fetching para evitar waterfalls (React Best Practices)
  const [movies, series, anime] = await Promise.all([
    getTrendingMedia("movie", 1),
    getTrendingMedia("tv", 1),
    getTrendingAnime(1),
  ]);

  const featured = movies[0] || anime[0] || series[0];

  return (
    <div className="flex flex-col gap-10">
      {/* Featured Spotlight Banner */}
      {featured && <HeroBanner item={featured} />}

      {/* Client-side Continue Watching (localStorage) */}
      <ContinueWatching />

      {/* Movies Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-white">Películas Populares</h2>
          </div>
          <Link
            href="/peliculas"
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={movies.slice(0, 6)} />
      </section>

      {/* Series Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-white">Series Destacadas</h2>
          </div>
          <Link
            href="/series"
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={series.slice(0, 6)} />
      </section>

      {/* Anime Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-white">Anime en Emisión</h2>
          </div>
          <Link
            href="/anime"
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Ver catálogo completo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={anime.slice(0, 6)} />
      </section>
    </div>
  );
}

import Link from "next/link";
import { getCachedCatalog } from "@/services/catalog-cache";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import { MediaGrid } from "@/components/media/MediaGrid";
import { Film, Tv, Sparkles, ChevronRight } from "lucide-react";

export const revalidate = 3600; // Cache 1 hora

export default async function HomePage() {
  const [moviesRes, seriesRes, animeRes] = await Promise.all([
    getCachedCatalog("movie", 1),
    getCachedCatalog("tv", 1),
    getCachedCatalog("anime", 1),
  ]);

  const movies = moviesRes.data;
  const series = seriesRes.data;
  const anime = animeRes.data;

  const featured = movies[0] || anime[0] || series[0];

  return (
    <div className="flex flex-col gap-10">
      {/* Featured Spotlight Banner */}
      {featured && <HeroBanner item={featured} />}

      {/* Client-side Continue Watching (localStorage) */}
      <ContinueWatching />

      {/* Películas Populares */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-white">Películas populares</h2>
          </div>
          <Link
            href="/peliculas"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={movies.slice(0, 6)} />
      </section>

      {/* Series Destacadas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-white">Series destacadas</h2>
          </div>
          <Link
            href="/series"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={series.slice(0, 6)} />
      </section>

      {/* Anime en Emisión */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-white">Anime en emisión</h2>
          </div>
          <Link
            href="/anime"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Ver catálogo completo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <MediaGrid items={anime.slice(0, 6)} />
      </section>
    </div>
  );
}

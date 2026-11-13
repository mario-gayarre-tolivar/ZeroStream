import Link from "next/link";
import { getCachedCatalog } from "@/services/catalog-cache";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import { MediaGrid } from "@/components/media/MediaGrid";

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
    <div className="flex flex-col gap-14 sm:gap-20">
      {/* Featured Spotlight Banner */}
      {featured && <HeroBanner item={featured} />}

      {/* Client-side Continue Watching (localStorage) */}
      <ContinueWatching />

      {/* Películas Populares */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Películas populares
          </h2>
          <Link
            href="/peliculas"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Ver todo
          </Link>
        </div>
        <MediaGrid items={movies.slice(0, 6)} />
      </section>

      {/* Series Destacadas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Series destacadas
          </h2>
          <Link
            href="/series"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Ver todo
          </Link>
        </div>
        <MediaGrid items={series.slice(0, 6)} />
      </section>

      {/* Anime en Emisión */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Anime en emisión
          </h2>
          <Link
            href="/anime"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Ver todo
          </Link>
        </div>
        <MediaGrid items={anime.slice(0, 6)} />
      </section>
    </div>
  );
}

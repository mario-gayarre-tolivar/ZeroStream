import { getCachedCatalog } from "@/services/catalog-cache";
import { MediaGrid } from "@/components/media/MediaGrid";
import { FilterBar } from "@/components/media/FilterBar";
import { Film } from "lucide-react";

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
}

const MOVIE_GENRES = [
  "Acción",
  "Ciencia ficción",
  "Drama",
  "Aventura",
  "Crimen",
  "Suspense",
];

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const params = await searchParams;
  const query = params.q;
  const genre = params.genre;

  const { data: movies } = await getCachedCatalog("movie", 1, query, genre);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Film className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Catálogo de Películas
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Explora los estrenos y títulos más valorados del cine mundial sin almacenamiento propio.
        </p>
      </div>

      <FilterBar genres={MOVIE_GENRES} currentGenre={genre} />

      <MediaGrid
        items={movies}
        emptyMessage="No se encontraron películas para los filtros seleccionados."
      />
    </div>
  );
}

import { getCachedCatalog } from "@/services/catalog-cache";
import { FilterBar } from "@/components/media/FilterBar";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { Film, AlertCircle } from "lucide-react";

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    page?: string;
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
  const currentPage = parseInt(params.page || "1", 10) || 1;

  const { data: movies } = await getCachedCatalog("movie", currentPage, query, genre);

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
          Explora los estrenos y títulos más valorados del cine mundial con carga rápida y paginación continua.
        </p>
      </div>

      <FilterBar genres={MOVIE_GENRES} currentGenre={genre} />

      {movies.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-slate-500" />
          <p className="max-w-md text-sm text-slate-400">
            No se encontraron películas para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <LoadMoreCatalog
          initialItems={movies}
          type="movie"
          currentPage={currentPage}
          genre={genre}
          query={query}
        />
      )}
    </div>
  );
}

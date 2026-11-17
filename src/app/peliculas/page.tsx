import { getCachedCatalog } from "@/server/catalog-cache";
import { FilterBar } from "@/components/media/FilterBar";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { AlertCircle } from "lucide-react";

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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Catálogo de películas
        </h1>
        <p className="text-sm text-muted">
          Explora los títulos y estrenos más valorados del cine mundial con carga rápida y paginación continua.
        </p>
      </div>

      <FilterBar genres={MOVIE_GENRES} currentGenre={genre} />

      {movies.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-poster border border-dashed border-border-active bg-surface p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-faint" aria-hidden="true" />
          <p className="max-w-md text-sm text-muted">
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

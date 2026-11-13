import { getCachedCatalog } from "@/services/catalog-cache";
import { FilterBar } from "@/components/media/FilterBar";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { AlertCircle } from "lucide-react";

export const revalidate = 3600;

interface SeriesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    page?: string;
  }>;
}

const SERIES_GENRES = [
  "Drama",
  "Ciencia ficción",
  "Fantasía",
  "Animación",
  "Misterio",
  "Acción",
];

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const params = await searchParams;
  const query = params.q;
  const genre = params.genre;
  const currentPage = parseInt(params.page || "1", 10) || 1;

  const { data: series } = await getCachedCatalog("tv", currentPage, query, genre);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Catálogo de series
        </h1>
        <p className="text-sm text-muted">
          Temporadas completas y episodios organizados con carga dinámica y paginación rápida.
        </p>
      </div>

      <FilterBar genres={SERIES_GENRES} currentGenre={genre} />

      {series.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-poster border border-dashed border-border-active bg-surface p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-faint" aria-hidden="true" />
          <p className="max-w-md text-sm text-muted">
            No se encontraron series para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <LoadMoreCatalog
          initialItems={series}
          type="tv"
          currentPage={currentPage}
          genre={genre}
          query={query}
        />
      )}
    </div>
  );
}

import { getCachedCatalog } from "@/services/catalog-cache";
import { FilterBar } from "@/components/media/FilterBar";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { Tv, AlertCircle } from "lucide-react";

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Catálogo de Series de TV
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Temporadas completas y episodios organizados con carga dinámica y paginación rápida.
        </p>
      </div>

      <FilterBar genres={SERIES_GENRES} currentGenre={genre} />

      {series.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-slate-500" />
          <p className="max-w-md text-sm text-slate-400">
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

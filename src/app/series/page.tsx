import { getCachedCatalog } from "@/services/catalog-cache";
import { MediaGrid } from "@/components/media/MediaGrid";
import { FilterBar } from "@/components/media/FilterBar";
import { Tv } from "lucide-react";

export const revalidate = 3600;

interface SeriesPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
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

  const { data: series } = await getCachedCatalog("tv", 1, query, genre);

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
          Temporadas completas y episodios organizados con reproductores externos protegidos.
        </p>
      </div>

      <FilterBar genres={SERIES_GENRES} currentGenre={genre} />

      <MediaGrid
        items={series}
        emptyMessage="No se encontraron series para los filtros seleccionados."
      />
    </div>
  );
}

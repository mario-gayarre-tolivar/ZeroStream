import { getCachedCatalog } from "@/services/catalog-cache";
import { FilterBar } from "@/components/media/FilterBar";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { AlertCircle } from "lucide-react";

export const revalidate = 3600;

interface AnimePageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    page?: string;
  }>;
}

const ANIME_GENRES = [
  "Action",
  "Adventure",
  "Fantasy",
  "Supernatural",
  "Comedy",
  "Mystery",
  "Sci-Fi",
];

export default async function AnimePage({ searchParams }: AnimePageProps) {
  const params = await searchParams;
  const query = params.q;
  const genre = params.genre;
  const currentPage = parseInt(params.page || "1", 10) || 1;

  const { data: animeList } = await getCachedCatalog("anime", currentPage, query, genre);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Catálogo de anime
        </h1>
        <p className="text-sm text-muted">
          Emisiones y series completas con paginación numérica y carga progresiva en vivo.
        </p>
      </div>

      <FilterBar genres={ANIME_GENRES} currentGenre={genre} />

      {animeList.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-poster border border-dashed border-border-active bg-surface p-8 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-faint" aria-hidden="true" />
          <p className="max-w-md text-sm text-muted">
            No se encontraron animes para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <LoadMoreCatalog
          initialItems={animeList}
          type="anime"
          currentPage={currentPage}
          genre={genre}
          query={query}
        />
      )}
    </div>
  );
}

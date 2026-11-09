import { getTrendingAnime } from "@/services/anilist";
import { MediaGrid } from "@/components/media/MediaGrid";
import { FilterBar } from "@/components/media/FilterBar";
import { Sparkles } from "lucide-react";

export const revalidate = 3600;

interface AnimePageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
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

  const animeList = await getTrendingAnime(1, query, genre);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Catálogo de Anime
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Emisiones semanales y series clásicas conectadas en tiempo real con la base de datos de AniList.
        </p>
      </div>

      <FilterBar genres={ANIME_GENRES} currentGenre={genre} />

      <MediaGrid
        items={animeList}
        emptyMessage="No se encontraron animes para los filtros seleccionados."
      />
    </div>
  );
}

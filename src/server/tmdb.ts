import { MediaDetail, MediaItem } from "@/types";
import { TmdbListResponseSchema } from "@/shared/schemas";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE =
  process.env.TMDB_IMAGE_BASE ||
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE ||
  "https://image.tmdb.org/t/p";
const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "";

// Dataset de respaldo para Películas (Cine real)
const FALLBACK_MOVIES: MediaItem[] = [
  {
    id: 157336,
    title: "Interstellar",
    originalTitle: "Interstellar",
    type: "movie",
    overview: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la raza humana.",
    posterPath: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.7,
    releaseDate: "2014-11-05",
    genres: ["Ciencia ficción", "Drama", "Aventura"],
    duration: "169 min",
  },
  {
    id: 27205,
    title: "Inception",
    originalTitle: "Inception",
    type: "movie",
    overview: "Dom Cobb es un ladrón experto en el peligroso arte de la extracción: robar valiosos secretos de lo más profundo del subconsciente durante el sueño.",
    posterPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.8,
    releaseDate: "2010-07-15",
    genres: ["Acción", "Ciencia ficción", "Suspense"],
    duration: "148 min",
  },
  {
    id: 693134,
    title: "Dune: Parte Dos",
    originalTitle: "Dune: Part Two",
    type: "movie",
    overview: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.5,
    releaseDate: "2024-02-27",
    genres: ["Ciencia ficción", "Aventura"],
    duration: "166 min",
  },
  {
    id: 155,
    title: "The Dark Knight",
    originalTitle: "The Dark Knight",
    type: "movie",
    overview: "Batman se enfrenta a su mayor desafío psicológico y físico cuando el Joker desata el caos anárquico en las calles de Gotham.",
    posterPath: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 9.0,
    releaseDate: "2008-07-16",
    genres: ["Acción", "Crimen", "Drama"],
    duration: "152 min",
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    originalTitle: "Avengers: Endgame",
    type: "movie",
    overview: "Tras los devastadores eventos de Infinity War, el universo está en ruinas. Los Vengadores restantes se reúnen una vez más para deshacer las acciones de Thanos.",
    posterPath: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.3,
    releaseDate: "2019-04-24",
    genres: ["Acción", "Ciencia ficción"],
    duration: "181 min",
  },
  {
    id: 550,
    title: "Fight Club",
    originalTitle: "Fight Club",
    type: "movie",
    overview: "Un empleado de oficina insomne y un descarado fabricante de jabón forman un club clandestino que evoluciona hacia algo mucho más caótico.",
    posterPath: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.4,
    releaseDate: "1999-10-15",
    genres: ["Drama", "Suspense"],
    duration: "139 min",
  },
];

// Dataset de respaldo para Series (Series reales)
const FALLBACK_SERIES: MediaItem[] = [
  {
    id: 1396,
    title: "Breaking Bad",
    originalTitle: "Breaking Bad",
    type: "tv",
    overview: "Un profesor de química de secundaria diagnosticado con cáncer de pulmón inoperable recurre a la fabricación y venta de metanfetamina para asegurar el futuro de su familia.",
    posterPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 9.5,
    releaseDate: "2008-01-20",
    genres: ["Drama", "Crimen", "Suspense"],
    totalSeasons: 5,
    totalEpisodes: 62,
    status: "Finalizada",
  },
  {
    id: 1399,
    title: "Game of Thrones",
    originalTitle: "Game of Thrones",
    type: "tv",
    overview: "Nueve familias nobles luchan por el control de las tierras de Westeros, mientras un antiguo enemigo regresa tras estar inactivo durante milenios.",
    posterPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.4,
    releaseDate: "2011-04-17",
    genres: ["Fantasía", "Drama", "Acción"],
    totalSeasons: 8,
    totalEpisodes: 73,
    status: "Finalizada",
  },
  {
    id: 66732,
    title: "Stranger Things",
    originalTitle: "Stranger Things",
    type: "tv",
    overview: "Cuando un niño desaparece, sus amigos, la familia y la policía local se ven envueltos en un misterio extraordinario que involucra experimentos secretos y fuerzas sobrenaturales.",
    posterPath: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.6,
    releaseDate: "2016-07-15",
    genres: ["Ciencia ficción", "Drama", "Misterio"],
    totalSeasons: 4,
    totalEpisodes: 34,
    status: "En emisión",
  },
  {
    id: 100088,
    title: "The Last of Us",
    originalTitle: "The Last of Us",
    type: "tv",
    overview: "Veinte años después de que una pandemia de hongos destruyera la civilización, Joel es contratado para sacar de contrabando a Ellie, una niña de 14 años, de una zona de cuarentena.",
    posterPath: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.6,
    releaseDate: "2023-01-15",
    genres: ["Drama", "Acción", "Aventura"],
    totalSeasons: 1,
    totalEpisodes: 9,
    status: "En emisión",
  },
  {
    id: 94605,
    title: "Arcane",
    originalTitle: "Arcane",
    type: "tv",
    overview: "En medio del conflicto entre las ciudades gemelas de Piltover y Zaun, dos hermanas luchan en bandos opuestos de una guerra entre tecnologías mágicas y convicciones incompatibles.",
    posterPath: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.9,
    releaseDate: "2021-11-06",
    genres: ["Animación", "Ciencia ficción", "Acción"],
    totalSeasons: 2,
    totalEpisodes: 18,
    status: "Finalizada",
  },
  {
    id: 70523,
    title: "Dark",
    originalTitle: "Dark",
    type: "tv",
    overview: "La desaparición de dos niños en la pequeña ciudad alemana de Winden saca a la luz las dobles vidas y las relaciones fracturadas entre cuatro familias conectadas a través del tiempo.",
    posterPath: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.5,
    releaseDate: "2017-12-01",
    genres: ["Ciencia ficción", "Misterio", "Drama"],
    totalSeasons: 3,
    totalEpisodes: 26,
    status: "Finalizada",
  },
];

export async function getTrendingMedia(
  type: "movie" | "tv",
  page: number = 1,
  search?: string,
  genre?: string
): Promise<MediaItem[]> {
  if (API_KEY) {
    try {
      let endpoint = `${TMDB_API_URL}/trending/${type}/week?api_key=${API_KEY}&language=es-ES&page=${page}`;
      if (search) {
        endpoint = `${TMDB_API_URL}/search/${type}?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
          search
        )}&page=${page}`;
      }

      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (res.ok) {
        const json = await res.json();
        const parsed = TmdbListResponseSchema.safeParse(json);

        if (parsed.success) {
          return parsed.data.results.map((item) => ({
            id: item.id,
            title: item.title || item.name || "Sin título",
            originalTitle: item.original_title || item.original_name,
            type,
            overview: item.overview || "Sin descripción disponible.",
            posterPath: item.poster_path
              ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
            backdropPath: item.backdrop_path
              ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}`
              : undefined,
            voteAverage: Number((item.vote_average || 7.5).toFixed(1)),
            releaseDate: item.release_date || item.first_air_date || "",
            genres: [],
          }));
        }
      }
    } catch (e) {
      console.error(`Error fetching TMDB ${type}:`, e);
    }
  }

  // Fallback si no hay API Key o falla la red
  const source = type === "movie" ? FALLBACK_MOVIES : FALLBACK_SERIES;
  let filtered = [...source];
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((i) => i.title.toLowerCase().includes(s));
  }
  if (genre) {
    filtered = filtered.filter((i) =>
      i.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }
  return filtered;
}

export async function getMediaDetail(
  type: "movie" | "tv",
  id: string | number
): Promise<MediaDetail> {
  if (API_KEY) {
    try {
      const endpoint = `${TMDB_API_URL}/${type}/${id}?api_key=${API_KEY}&language=es-ES&append_to_response=videos`;
      const res = await fetch(endpoint, { next: { revalidate: 3600 } });
      if (res.ok) {
        const item = await res.json();
        const trailer = item.videos?.results?.find(
          (v: { site?: string; type?: string; key?: string }) =>
            v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );

        let seasons = undefined;
        if (type === "tv" && Array.isArray(item.seasons)) {
          seasons = item.seasons
            .filter((s: { season_number?: number }) => (s.season_number ?? 0) > 0)
            .map((s: { season_number?: number; name?: string; episode_count?: number }) => {
              const sNum = s.season_number ?? 1;
              const epCount = s.episode_count || 10;
              return {
                seasonNumber: sNum,
                name: s.name || `Temporada ${sNum}`,
                episodeCount: epCount,
                episodes: Array.from({ length: epCount }, (_, i) => ({
                  seasonNumber: sNum,
                  episodeNumber: i + 1,
                  title: `Episodio ${i + 1}`,
                  overview: `Episodio ${i + 1} de la Temporada ${sNum}`,
                })),
              };
            });
        }

        return {
          id: item.id,
          title: item.title || item.name || "Sin título",
          originalTitle: item.original_title || item.original_name,
          type,
          overview: item.overview || "Sin descripción disponible.",
          posterPath: item.poster_path
            ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
            : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
          backdropPath: item.backdrop_path
            ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}`
            : undefined,
          voteAverage: Number((item.vote_average || 7.5).toFixed(1)),
          releaseDate: item.release_date || item.first_air_date || "",
          genres: item.genres?.map((g: { name: string }) => g.name) || [],
          duration: item.runtime ? `${item.runtime} min` : undefined,
          tagline: item.tagline,
          trailerYoutubeId: trailer?.key,
          seasons,
          status: item.status,
        };
      }
    } catch (e) {
      console.error(`Error fetching TMDB detail ${type} ${id}:`, e);
    }
  }

  // Fallback seguro
  const list = type === "movie" ? FALLBACK_MOVIES : FALLBACK_SERIES;
  const found = list.find((m) => String(m.id) === String(id)) || list[0];
  let seasons = undefined;
  if (type === "tv") {
    const totalSeasons = found.totalSeasons || 3;
    seasons = Array.from({ length: totalSeasons }, (_, sIdx) => {
      const sNum = sIdx + 1;
      return {
        seasonNumber: sNum,
        name: `Temporada ${sNum}`,
        episodeCount: 10,
        episodes: Array.from({ length: 10 }, (_, eIdx) => ({
          seasonNumber: sNum,
          episodeNumber: eIdx + 1,
          title: `Episodio ${eIdx + 1}`,
          overview: `Episodio ${eIdx + 1} de la Temporada ${sNum} de ${found.title}`,
        })),
      };
    });
  }

  return {
    ...found,
    seasons,
  };
}

import { MediaDetail, MediaItem } from "@/types";

const ANILIST_API_URL = "https://graphql.anilist.co";

const POPULAR_ANIME_QUERY = `
query ($page: Int, $perPage: Int, $search: String, $genre: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC, search: $search, genre: $genre) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        extraLarge
        large
      }
      bannerImage
      averageScore
      episodes
      seasonYear
      status
      genres
    }
  }
}
`;

const ANIME_DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    idMal
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
    }
    bannerImage
    averageScore
    episodes
    seasonYear
    status
    genres
    duration
    trailer {
      id
      site
    }
  }
}
`;

// Dataset inicial con animes icónicos de respaldo
const FALLBACK_ANIME: MediaItem[] = [
  {
    id: 16498,
    title: "Shingeki no Kyojin",
    originalTitle: "進撃の巨人",
    type: "anime",
    overview: "Tras la destrucción de su ciudad natal a manos de los Titanes, Eren Jaeger jura limpiar la Tierra de los gigantescos devoradores de humanos que han llevado a la humanidad al borde de la extinción.",
    posterPath: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.9,
    releaseDate: "2013",
    genres: ["Acción", "Fantasía", "Misterio"],
    totalEpisodes: 25,
    status: "FINISHED",
  },
  {
    id: 113415,
    title: "Jujutsu Kaisen",
    originalTitle: "呪術廻戦",
    type: "anime",
    overview: "Yuji Itadori es un estudiante con una destreza física excepcional que termina tragándose el dedo de Ryomen Sukuna, una poderosa maldición, adentrándose en el mundo de los hechiceros jujutsu.",
    posterPath: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.7,
    releaseDate: "2020",
    genres: ["Acción", "Sobrenatural", "Escolar"],
    totalEpisodes: 24,
    status: "RELEASING",
  },
  {
    id: 101922,
    title: "Kimetsu no Yaiba",
    originalTitle: "鬼滅の刃",
    type: "anime",
    overview: "Tanjiro Kamado se convierte en cazador de demonios para vengar a su familia asesinada y encontrar una cura para su hermana Nezuko, convertida en demonio.",
    posterPath: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.6,
    releaseDate: "2019",
    genres: ["Acción", "Fantasía histórica", "Demonios"],
    totalEpisodes: 26,
    status: "RELEASING",
  },
  {
    id: 127230,
    title: "Chainsaw Man",
    originalTitle: "チェンソーマン",
    type: "anime",
    overview: "Denji es un joven atrapado en la pobreza extrema que vive con Pochita, el demonio motosierra. Tras un pacto mortal, renace como el Híbrido Cazador de Demonios.",
    posterPath: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.5,
    releaseDate: "2022",
    genres: ["Acción", "Gore", "Sobrenatural"],
    totalEpisodes: 12,
    status: "FINISHED",
  },
  {
    id: 1535,
    title: "Death Note",
    originalTitle: "デスノート",
    type: "anime",
    overview: "Light Yagami encuentra un cuaderno sobrenatural capaz de matar a cualquier persona cuyo nombre sea escrito en él, iniciando un juego intelectual contra el detective L.",
    posterPath: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.8,
    releaseDate: "2006",
    genres: ["Misterio", "Psicológico", "Suspense"],
    totalEpisodes: 37,
    status: "FINISHED",
  },
  {
    id: 20,
    title: "Naruto",
    originalTitle: "NARUTO -ナルト-",
    type: "anime",
    overview: "Un joven ninja huérfano sueña con ganarse el reconocimiento de su aldea y convertirse en el Hokage más poderoso de todos.",
    posterPath: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
    backdropPath: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    voteAverage: 8.4,
    releaseDate: "2002",
    genres: ["Acción", "Aventura", "Shounen"],
    totalEpisodes: 220,
    status: "FINISHED",
  },
];

export async function getTrendingAnime(
  page: number = 1,
  search?: string,
  genre?: string
): Promise<MediaItem[]> {
  try {
    const res = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: POPULAR_ANIME_QUERY,
        variables: {
          page,
          perPage: 24,
          search: search?.trim() || undefined,
          genre: genre || undefined,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn("AniList request failed, using fallback");
      return filterFallback(FALLBACK_ANIME, search, genre);
    }

    const data = await res.json();
    const mediaList = data?.data?.Page?.media || [];

    if (!mediaList.length) {
      return filterFallback(FALLBACK_ANIME, search, genre);
    }

    return mediaList.map((m: any) => ({
      id: m.id,
      title: m.title.english || m.title.romaji || m.title.native,
      originalTitle: m.title.native || m.title.romaji,
      type: "anime" as const,
      overview: cleanOverview(m.description),
      posterPath: m.coverImage.extraLarge || m.coverImage.large,
      backdropPath: m.bannerImage || m.coverImage.extraLarge,
      voteAverage: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
      releaseDate: m.seasonYear ? String(m.seasonYear) : "2023",
      genres: m.genres || ["Anime"],
      totalEpisodes: m.episodes || 12,
      status: m.status,
    }));
  } catch (error) {
    console.error("AniList fetch error:", error);
    return filterFallback(FALLBACK_ANIME, search, genre);
  }
}

export async function getAnimeDetail(id: string | number): Promise<MediaDetail> {
  const numericId = Number(id);
  try {
    const res = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: ANIME_DETAIL_QUERY,
        variables: { id: numericId },
      }),
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const m = data?.data?.Media;
      if (m) {
        const totalEp = m.episodes || 12;
        const episodesList = Array.from({ length: totalEp }, (_, i) => ({
          episodeNumber: i + 1,
          seasonNumber: 1,
          title: `Episodio ${i + 1}`,
          overview: `Episodio ${i + 1} de ${m.title.english || m.title.romaji}`,
        }));

        return {
          id: m.id,
          title: m.title.english || m.title.romaji || m.title.native,
          originalTitle: m.title.native || m.title.romaji,
          type: "anime",
          overview: cleanOverview(m.description),
          posterPath: m.coverImage.extraLarge || m.coverImage.large,
          backdropPath: m.bannerImage || m.coverImage.extraLarge,
          voteAverage: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : 8.0,
          releaseDate: m.seasonYear ? String(m.seasonYear) : "2023",
          genres: m.genres || ["Anime"],
          totalEpisodes: totalEp,
          status: m.status,
          duration: m.duration ? `${m.duration} min` : "24 min",
          trailerYoutubeId: m.trailer?.site === "youtube" ? m.trailer?.id : undefined,
          seasons: [
            {
              seasonNumber: 1,
              name: "Temporada 1",
              episodeCount: totalEp,
              episodes: episodesList,
            },
          ],
        };
      }
    }
  } catch (e) {
    console.error("Error fetching anime detail:", e);
  }

  // Fallback si no hay conexión o no existe
  const found = FALLBACK_ANIME.find((a) => String(a.id) === String(id)) || FALLBACK_ANIME[0];
  const totalEp = found.totalEpisodes || 12;
  return {
    ...found,
    seasons: [
      {
        seasonNumber: 1,
        name: "Temporada 1",
        episodeCount: totalEp,
        episodes: Array.from({ length: totalEp }, (_, i) => ({
          episodeNumber: i + 1,
          seasonNumber: 1,
          title: `Episodio ${i + 1}`,
          overview: `Episodio ${i + 1} de la serie ${found.title}`,
        })),
      },
    ],
  };
}

function cleanOverview(desc?: string): string {
  if (!desc) return "Sin descripción disponible.";
  return desc.replace(/<[^>]*>/g, "").trim();
}

function filterFallback(list: MediaItem[], search?: string, genre?: string): MediaItem[] {
  let res = [...list];
  if (search) {
    const s = search.toLowerCase();
    res = res.filter((item) => item.title.toLowerCase().includes(s));
  }
  if (genre) {
    res = res.filter((item) =>
      item.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }
  return res;
}

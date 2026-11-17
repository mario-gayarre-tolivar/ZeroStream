import { NextRequest, NextResponse } from "next/server";
import { getCachedCatalog } from "@/server/catalog-cache";

export const revalidate = 600; // 10 minutos de caché para búsquedas en Edge

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({
      query: "",
      totalResults: 0,
      movies: [],
      series: [],
      anime: [],
    });
  }

  try {
    // Búsqueda en paralelo en los 3 catálogos (React Best Practices: async-parallel)
    const [moviesRes, seriesRes, animeRes] = await Promise.all([
      getCachedCatalog("movie", 1, query),
      getCachedCatalog("tv", 1, query),
      getCachedCatalog("anime", 1, query),
    ]);

    const movies = moviesRes.data.slice(0, 4);
    const series = seriesRes.data.slice(0, 4);
    const anime = animeRes.data.slice(0, 4);

    return NextResponse.json(
      {
        query,
        totalResults: movies.length + series.length + anime.length,
        movies,
        series,
        anime,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("Error en API global de búsqueda:", error);
    return NextResponse.json(
      { error: "Error al procesar búsqueda global" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { MediaType } from "@/types";
import { getCachedCatalog } from "@/server/catalog-cache";

export const revalidate = 3600; // 1 hora ISR Edge Cache

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;

  if (!["movie", "tv", "anime"].includes(type)) {
    return NextResponse.json(
      { error: "Tipo de catálogo no válido. Opciones: movie, tv, anime" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("q") || undefined;
  const genre = searchParams.get("genre") || undefined;

  try {
    const { data, source } = await getCachedCatalog(
      type as MediaType,
      isNaN(page) || page < 1 ? 1 : page,
      query,
      genre
    );

    return NextResponse.json(
      {
        type,
        page,
        totalResults: data.length,
        results: data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "X-Catalog-Source": source,
        },
      }
    );
  } catch (error) {
    console.error(`Error en Route Handler /api/catalog/${type}:`, error);
    return NextResponse.json(
      { error: "Error interno al recuperar catálogo" },
      { status: 500 }
    );
  }
}

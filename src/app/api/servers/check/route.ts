import { NextRequest, NextResponse } from "next/server";
import { ServerCheckRequestSchema } from "@/services/schemas";
import { getEmbedServers } from "@/services/embeds";
import { checkServersHealth } from "@/services/server-health";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const validation = ServerCheckRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Parámetros inválidos",
        details: validation.error.format(),
      },
      { status: 400 }
    );
  }

  try {
    const data = validation.data;

    // Anti-SSRF Estricto: Las URLs se generan exclusivamente en el servidor
    const servers = getEmbedServers(
      data.type,
      data.id,
      data.season,
      data.episode,
      data.title,
      data.tmdbId,
      data.malId
    );

    const healthResponse = await checkServersHealth(servers, data.type, {
      forceRefresh: data.forceRefresh,
    });

    return NextResponse.json(healthResponse, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error al verificar servidores:", error);
    return NextResponse.json(
      { error: "Error al verificar servidores" },
      { status: 500 }
    );
  }
}

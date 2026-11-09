import { getMediaDetail } from "@/services/tmdb";
import { getAnimeDetail } from "@/services/anilist";
import { MediaType } from "@/types";
import { PlayerViewClient } from "./PlayerViewClient";
import { notFound } from "next/navigation";

export const revalidate = 3600;

interface PlayerPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
  searchParams: Promise<{
    s?: string;
    e?: string;
  }>;
}

export default async function PlayerPage({
  params,
  searchParams,
}: PlayerPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const type = resolvedParams.type as MediaType;
  const id = resolvedParams.id;

  if (!["movie", "tv", "anime"].includes(type)) {
    notFound();
  }

  const season = resolvedSearchParams.s ? parseInt(resolvedSearchParams.s, 10) : 1;
  const episode = resolvedSearchParams.e ? parseInt(resolvedSearchParams.e, 10) : 1;

  let media = null;
  if (type === "anime") {
    media = await getAnimeDetail(id);
  } else {
    media = await getMediaDetail(type, id);
  }

  if (!media) {
    notFound();
  }

  return (
    <PlayerViewClient
      media={media}
      initialSeason={isNaN(season) || season < 1 ? 1 : season}
      initialEpisode={isNaN(episode) || episode < 1 ? 1 : episode}
    />
  );
}

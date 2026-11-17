import { Metadata } from "next";
import { getMediaDetail } from "@/server/tmdb";
import { getAnimeDetail } from "@/server/anilist";
import { MediaType } from "@/types";
import { PlayerViewClient } from "@/components/player/PlayerViewClient";
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

export async function generateMetadata({
  params,
  searchParams,
}: PlayerPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const type = resolvedParams.type as MediaType;
  const id = resolvedParams.id;
  const season = resolvedSearchParams.s ? parseInt(resolvedSearchParams.s, 10) : 1;
  const episode = resolvedSearchParams.e ? parseInt(resolvedSearchParams.e, 10) : 1;

  let media = null;
  try {
    if (type === "anime") {
      media = await getAnimeDetail(id);
    } else {
      media = await getMediaDetail(type, id);
    }
  } catch (e) {
    console.error("Error generating metadata:", e);
  }

  if (!media) {
    return {
      title: "Ver Contenido",
      description: "Reproducción en streaming libre",
    };
  }

  const epLabel = type !== "movie" ? ` (T${season}:E${episode})` : "";
  const title = `Ver ${media.title}${epLabel}`;
  const description =
    media.overview?.slice(0, 160) || "Streaming en alta definición sin almacenamiento propio.";
  const image = media.backdropPath || media.posterPath;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.other",
      images: image ? [{ url: image, alt: media.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
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

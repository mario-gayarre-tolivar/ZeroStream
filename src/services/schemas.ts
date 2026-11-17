import { z } from "zod";

/**
 * Esquema de validación para elementos en listas de TMDB.
 */
export const TmdbItemSchema = z.object({
  id: z.number().or(z.string()),
  title: z.string().optional(),
  name: z.string().optional(),
  original_title: z.string().optional(),
  original_name: z.string().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  release_date: z.string().nullable().optional(),
  first_air_date: z.string().nullable().optional(),
});

/**
 * Esquema de respuesta para listas de TMDB.
 */
export const TmdbListResponseSchema = z.object({
  results: z.array(TmdbItemSchema).default([]),
});

/**
 * Esquema de respuesta GraphQL para AniList.
 */
export const AniListMediaSchema = z.object({
  id: z.number().or(z.string()),
  title: z.object({
    english: z.string().nullable().optional(),
    romaji: z.string().nullable().optional(),
    native: z.string().nullable().optional(),
  }),
  description: z.string().nullable().optional(),
  coverImage: z.object({
    extraLarge: z.string().nullable().optional(),
    large: z.string().nullable().optional(),
  }),
  bannerImage: z.string().nullable().optional(),
  averageScore: z.number().nullable().optional(),
  episodes: z.number().nullable().optional(),
  seasonYear: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  genres: z.array(z.string()).default([]),
});

export const AniListPageResponseSchema = z.object({
  data: z.object({
    Page: z.object({
      media: z.array(AniListMediaSchema).default([]),
    }),
  }),
});

/**
 * Esquema de validación para la petición de verificación de servidores (POST /api/servers/check).
 */
export const ServerCheckRequestSchema = z.object({
  type: z.enum(["movie", "tv", "anime"]),
  id: z.union([z.string().min(1), z.number().int().positive()]),
  season: z.number().int().min(1).default(1),
  episode: z.number().int().min(1).default(1),
  title: z.string().optional(),
  tmdbId: z.union([z.string().min(1), z.number().int().positive()]).optional(),
  malId: z.union([z.string().min(1), z.number().int().positive()]).optional(),
  forceRefresh: z.boolean().default(false),
});

export type ServerCheckRequest = z.infer<typeof ServerCheckRequestSchema>;


import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://zerostream.vercel.app";
  const now = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/peliculas`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/series`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/anime`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/mi-lista`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://zerostream.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

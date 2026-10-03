import type { MetadataRoute } from "next";

import { SERVER_URL } from "@/lib/constants";
import { getAllPublishedSlugs } from "@/lib/queries/posts";

// Built per request so new posts appear without a rebuild
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedSlugs();

  return [
    { url: SERVER_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SERVER_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SERVER_URL}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SERVER_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...posts.map((post) => ({
      url: `${SERVER_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

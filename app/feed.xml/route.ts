import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { getPublishedPosts } from "@/lib/queries/posts";
import { buildRss } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  const { posts } = await getPublishedPosts({ limit: 30 });

  const xml = buildRss({
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteUrl: SERVER_URL,
    items: posts.map((post) => ({
      title: post.title,
      url: `${SERVER_URL}/blog/${post.slug}`,
      description: post.excerpt,
      publishedAt: post.publishedAt ?? new Date(),
      author: post.author.name,
      categories: post.tags.map((tag) => tag.name),
    })),
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}

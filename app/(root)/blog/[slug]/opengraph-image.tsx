import { APP_NAME } from "@/lib/constants";
import { ogSize, renderOgImage } from "@/lib/og";
import { getPostBySlug } from "@/lib/queries/posts";
import { formatDate, readingTime } from "@/lib/utils";

export const alt = APP_NAME;
export const size = ogSize;
export const contentType = "image/png";

// Share card with the post title; drafts and unknown slugs get the site card
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);

  if (!post) return renderOgImage({ title: APP_NAME });

  const detail = [
    post.author.name,
    post.publishedAt ? formatDate(post.publishedAt) : null,
    `${readingTime(post.content)} min read`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return renderOgImage({ title: post.title, detail });
}

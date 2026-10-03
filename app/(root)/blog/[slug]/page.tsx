import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { cache } from "react";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import Markdown from "@/components/shared/markdown";
import PostCard from "@/components/shared/post/post-card";
import PostMeta from "@/components/shared/post/post-meta";
import TagList from "@/components/shared/post/tag-list";
import { buttonVariants } from "@/components/ui/button";
import { isAdmin } from "@/lib/auth-guard";
import { APP_NAME, SERVER_URL } from "@/lib/constants";
import { getPostBySlug, getRelatedPosts, incrementPostViews } from "@/lib/queries/posts";
import { canOptimizeImage } from "@/lib/utils";

import Comments from "./comments";

type Params = Promise<{ slug: string }>;

/*
 * Published posts for everyone; admins also see drafts, as a preview.
 * cache() shares one lookup between generateMetadata and the page.
 */
const loadPost = cache(async (slug: string) => {
  const post = await getPostBySlug(slug);
  if (post) return post;

  return (await isAdmin()) ? getPostBySlug(slug, { includeDrafts: true }) : null;
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await loadPost((await params).slug);

  if (!post) return { title: "Post not found" };

  const url = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    alternates: { canonical: url },
    robots: post.status === "published" ? undefined : { index: false },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: post.tags.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const post = await loadPost((await params).slug);

  if (!post) notFound();

  const isDraft = post.status !== "published";

  // Count the view after the response is sent, so it doesn't slow the page
  if (!isDraft) after(() => incrementPostViews(post.id));

  const related = isDraft
    ? []
    : await getRelatedPosts(
        post.id,
        post.tags.map((tag) => tag.id),
      );

  // Structured data for search engines (schema.org BlogPosting)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    // Without a cover, search engines use the og:image share card
    ...(post.coverImage ? { image: post.coverImage } : {}),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: APP_NAME },
    mainEntityOfPage: `${SERVER_URL}/blog/${post.slug}`,
    keywords: post.tags.map((tag) => tag.name).join(", "),
  };

  return (
    <div className="py-10 md:py-16">
      {isDraft ? (
        <div
          role="status"
          className="prose-width mb-8 flex items-center justify-between gap-4 rounded-lg border border-dashed px-4 py-3 text-sm"
        >
          <span>
            <strong className="font-medium">Draft preview.</strong>{" "}
            <span className="text-muted-foreground">Only admins can see this page.</span>
          </span>
          <Link href={`/admin/posts/${post.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
            <PencilIcon /> Edit
          </Link>
        </div>
      ) : (
        <script
          type="application/ld+json"
          // JSON.stringify output with "<" escaped can't close the script tag
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      <article>
        <header className="prose-width space-y-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" /> All posts
          </Link>
          <TagList tags={post.tags} />
          <h1 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          <PostMeta author={post.author.name} publishedAt={post.publishedAt} content={post.content} />
        </header>

        {post.coverImage && (
          <div className="relative mx-auto mt-10 aspect-[2/1] max-w-5xl overflow-hidden rounded-xl border bg-muted">
            <Image
              src={post.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 64rem, 100vw"
              unoptimized={!canOptimizeImage(post.coverImage)}
              className="object-cover"
            />
          </div>
        )}

        <div className="prose-width mt-10 text-lg">
          <Markdown>{post.content}</Markdown>
        </div>

        {post.author.bio && (
          <aside className="prose-width mt-16 rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">Written by</p>
            <p className="mt-1 font-medium">{post.author.name}</p>
            <p className="mt-2 text-muted-foreground">{post.author.bio}</p>
          </aside>
        )}
      </article>

      {!isDraft && (
        <div className="prose-width mt-16">
          <Comments postId={post.id} slug={post.slug} />
        </div>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24 space-y-8 border-t pt-12">
          <h2 id="related-title" className="font-serif text-3xl tracking-tight">
            Keep reading
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

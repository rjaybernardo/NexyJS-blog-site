import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeftIcon } from "lucide-react";

import Markdown from "@/components/shared/markdown";
import PostCard from "@/components/shared/post/post-card";
import PostMeta from "@/components/shared/post/post-meta";
import TagList from "@/components/shared/post/tag-list";
import { canOptimizeImage } from "@/lib/utils";
import { getPostBySlug, getRelatedPosts, incrementPostViews } from "@/lib/queries/posts";

import Comments from "./comments";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const post = await getPostBySlug((await params).slug);

  if (!post) notFound();

  // Count the view after the response is sent, so it doesn't slow the page
  after(() => incrementPostViews(post.id));

  const related = await getRelatedPosts(
    post.id,
    post.tags.map((tag) => tag.id),
  );

  return (
    <div className="py-10 md:py-16">
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

      <div className="prose-width mt-16">
        <Comments postId={post.id} slug={post.slug} />
      </div>

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

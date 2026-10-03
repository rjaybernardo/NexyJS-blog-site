import type { Metadata } from "next";
import Link from "next/link";

import Pagination from "@/components/shared/pagination";
import PostCard from "@/components/shared/post/post-card";
import { getPopularTags, getPublishedPosts } from "@/lib/queries/posts";
import { cn, parsePage } from "@/lib/utils";

type SearchParams = Promise<{ q?: string; tag?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q, tag } = await searchParams;

  return {
    title: q ? `Search: ${q}` : tag ? `Topic: ${tag}` : "Blog",
    alternates: { canonical: tag ? `/blog?tag=${encodeURIComponent(tag)}` : "/blog" },
    // Search result pages are thin duplicates of posts
    robots: q ? { index: false } : undefined,
  };
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const tag = params.tag || undefined;
  const page = parsePage(params.page);

  const [{ posts, totalPages, total }, tags] = await Promise.all([
    getPublishedPosts({ query, tag, page }),
    getPopularTags(20),
  ]);

  const activeTag = tags.find((t) => t.slug === tag);

  return (
    <div className="space-y-10 py-10 md:py-16">
      <header className="space-y-3">
        <h1 className="font-serif text-5xl tracking-tight">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : activeTag ? activeTag.name : "All posts"}
        </h1>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "post" : "posts"}
          {(query || tag) && (
            <>
              {" · "}
              <Link href="/blog" className="underline underline-offset-4 hover:text-foreground">
                Clear filters
              </Link>
            </>
          )}
        </p>
      </header>

      {tags.length > 0 && (
        <nav aria-label="Topics" className="flex flex-wrap gap-2 border-b pb-6">
          <Link
            href="/blog"
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              !tag ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog?tag=${t.slug}`}
              aria-current={t.slug === tag ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                t.slug === tag
                  ? "border-foreground bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {posts.length > 0 ? (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No posts found.
        </p>
      )}

      <Pagination page={page} totalPages={totalPages} params={{ q: query, tag }} />
    </div>
  );
}

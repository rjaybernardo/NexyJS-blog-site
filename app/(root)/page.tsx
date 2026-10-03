import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import PostCard from "@/components/shared/post/post-card";
import { buttonVariants } from "@/components/ui/button";
import { APP_DESCRIPTION } from "@/lib/constants";
import { getFeaturedPost, getPopularTags, getPublishedPosts } from "@/lib/queries/posts";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [featured, { posts }, tags] = await Promise.all([
    getFeaturedPost(),
    getPublishedPosts({ limit: 7 }),
    getPopularTags(8),
  ]);

  // The featured post leads, so it isn't repeated in the grid
  const lead = featured ?? posts[0];
  const latest = posts.filter((post) => post.id !== lead?.id).slice(0, 6);

  return (
    <div className="space-y-20 py-10 md:py-16">
      <section className="max-w-3xl space-y-4">
        <h1 className="font-serif text-5xl tracking-tight text-balance md:text-6xl">
          {APP_DESCRIPTION}
        </h1>
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-2" aria-label="Popular topics">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <Link
                  href={`/blog?tag=${tag.slug}`}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lead ? (
        <>
          <section aria-label="Featured post">
            <PostCard post={lead} featured />
          </section>

          {latest.length > 0 && (
            <section aria-labelledby="latest-title" className="space-y-8">
              <div className="flex items-end justify-between gap-4 border-b pb-4">
                <h2 id="latest-title" className="font-serif text-3xl tracking-tight">
                  Latest posts
                </h2>
                <Link href="/blog" className={buttonVariants({ variant: "ghost", className: "gap-1" })}>
                  All posts <ArrowRightIcon className="size-4" />
                </Link>
              </div>
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No posts yet. Sign in as an admin and write the first one from the dashboard.
        </p>
      )}
    </div>
  );
}

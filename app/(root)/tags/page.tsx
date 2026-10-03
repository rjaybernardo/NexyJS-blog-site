import type { Metadata } from "next";
import Link from "next/link";

import { getPopularTags } from "@/lib/queries/posts";

export const metadata: Metadata = { title: "Topics", alternates: { canonical: "/tags" } };

export default async function TagsPage() {
  const tags = await getPopularTags(100);

  return (
    <div className="space-y-10 py-10 md:py-16">
      <h1 className="font-serif text-5xl tracking-tight">Topics</h1>

      {tags.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/blog?tag=${tag.slug}`}
                className="flex items-center justify-between rounded-xl border p-5 transition-colors hover:bg-muted/50"
              >
                <span className="font-serif text-xl">{tag.name}</span>
                <span className="text-sm text-muted-foreground">
                  {tag._count.posts} {tag._count.posts === 1 ? "post" : "posts"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No topics yet.</p>
      )}
    </div>
  );
}

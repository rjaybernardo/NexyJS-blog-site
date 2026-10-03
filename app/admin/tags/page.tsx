import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/admin/page-header";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { deleteTag } from "@/lib/actions/tag.actions";
import { getAllTags } from "@/lib/queries/admin";

import TagForm from "./tag-form";

export const metadata: Metadata = { title: "Tags" };

export default async function AdminTagsPage() {
  const tags = await getAllTags();

  return (
    <>
      <PageHeader title="Tags" description="Group posts into topics readers can browse." />

      <Card>
        <CardContent className="space-y-6">
          <TagForm />

          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {tags.map((tag) => (
                <li key={tag.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-medium">{tag.name}</span>
                  <Link href={`/blog?tag=${tag.slug}`} className="text-muted-foreground hover:underline">
                    /{tag.slug}
                  </Link>
                  <span className="ml-auto text-muted-foreground">
                    {tag._count.posts} {tag._count.posts === 1 ? "post" : "posts"}
                  </span>
                  <DeleteDialog id={tag.id} label="tag" action={deleteTag} iconOnly />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

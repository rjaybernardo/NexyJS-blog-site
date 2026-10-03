import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLinkIcon } from "lucide-react";

import PageHeader from "@/components/admin/page-header";
import PostForm from "@/components/admin/post-form";
import { buttonVariants } from "@/components/ui/button";
import { getAllTags, getPostForEdit } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [post, tags] = await Promise.all([getPostForEdit(id), getAllTags()]);

  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit post" description={post.title}>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className={buttonVariants({ variant: "outline" })}>
            View <ExternalLinkIcon />
          </Link>
        )}
      </PageHeader>
      <PostForm
        tags={tags}
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: post.status,
          featured: post.featured,
          tagIds: post.tags.map((tag) => tag.id),
        }}
      />
    </>
  );
}

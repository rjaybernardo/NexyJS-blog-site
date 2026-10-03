import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/page-header";
import PostForm from "@/components/admin/post-form";
import { prisma } from "@/lib/prisma";
import { getAllTags, getPostForEdit } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [post, tags, subscriberCount] = await Promise.all([
    getPostForEdit(id),
    getAllTags(),
    prisma.subscriber.count(),
  ]);

  if (!post) notFound();

  return (
    <>
      <PageHeader title="Edit post" description={post.title} />
      <PostForm
        tags={tags}
        subscriberCount={subscriberCount}
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
          notifiedAt: post.notifiedAt,
        }}
      />
    </>
  );
}

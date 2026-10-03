"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { formatError } from "@/lib/utils/server";
import { postSchema, updatePostSchema } from "@/lib/validators";

type ActionResult = { success: boolean; message: string; id?: string };

// Everything a post appears on: home, listing, the post, feeds
function revalidateBlog(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(
  data: z.infer<typeof postSchema>,
): Promise<ActionResult> {
  try {
    const session = await assertAdmin();
    const { tagIds, ...post } = postSchema.parse(data);

    const created = await prisma.post.create({
      data: {
        ...post,
        authorId: session.user.id,
        publishedAt: post.status === "published" ? new Date() : null,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });

    revalidateBlog(created.slug);

    return { success: true, message: "Post created", id: created.id };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updatePost(
  data: z.infer<typeof updatePostSchema>,
): Promise<ActionResult> {
  try {
    await assertAdmin();
    const { id, tagIds, ...post } = updatePostSchema.parse(data);

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { slug: true, publishedAt: true },
    });

    if (!existing) throw new Error("Post not found");

    await prisma.post.update({
      where: { id },
      data: {
        ...post,
        // Keep the original date when re-publishing an edited post
        publishedAt:
          post.status === "published"
            ? (existing.publishedAt ?? new Date())
            : existing.publishedAt,
        tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
      },
    });

    revalidateBlog(existing.slug);
    if (existing.slug !== post.slug) revalidateBlog(post.slug);

    return { success: true, message: "Post saved", id };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function setPostStatus(
  id: string,
  status: "draft" | "published",
): Promise<ActionResult> {
  try {
    await assertAdmin();

    const existing = await prisma.post.findUnique({
      where: { id: z.uuid().parse(id) },
      select: { slug: true, publishedAt: true },
    });

    if (!existing) throw new Error("Post not found");

    await prisma.post.update({
      where: { id },
      data: {
        status,
        publishedAt:
          status === "published"
            ? (existing.publishedAt ?? new Date())
            : existing.publishedAt,
      },
    });

    revalidateBlog(existing.slug);
    revalidatePath("/admin", "layout");

    return {
      success: true,
      message: status === "published" ? "Post published" : "Post unpublished",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();

    const post = await prisma.post.delete({
      where: { id: z.uuid().parse(id) },
      select: { slug: true },
    });

    revalidateBlog(post.slug);
    revalidatePath("/admin", "layout");

    return { success: true, message: "Post deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

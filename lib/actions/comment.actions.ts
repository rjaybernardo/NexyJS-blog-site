"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { assertAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/rate-limit";
import { formatError } from "@/lib/utils/server";
import { commentSchema } from "@/lib/validators";

export async function addComment(_prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Sign in to comment");

    const data = commentSchema.parse({
      postId: formData.get("postId"),
      content: formData.get("content"),
    });

    await assertRateLimit({ key: `comment:${session.user.id}`, limit: 10, windowMs: 10 * 60 * 1000 });

    const post = await prisma.post.findFirst({
      where: { id: data.postId, status: "published" },
      select: { slug: true },
    });

    if (!post) throw new Error("Post not found");

    await prisma.comment.create({
      data: { ...data, userId: session.user.id },
    });

    revalidatePath(`/blog/${post.slug}`);

    return { success: true, message: "Comment posted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Authors delete their own comments; admins delete any
export async function deleteComment(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Sign in first");

    const comment = await prisma.comment.findUnique({
      where: { id: z.uuid().parse(id) },
      select: { userId: true, post: { select: { slug: true } } },
    });

    if (!comment) throw new Error("Comment not found");

    if (comment.userId !== session.user.id) {
      await assertAdmin();
    }

    await prisma.comment.delete({ where: { id } });

    revalidatePath(`/blog/${comment.post.slug}`);
    revalidatePath("/admin", "layout");

    return { success: true, message: "Comment deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

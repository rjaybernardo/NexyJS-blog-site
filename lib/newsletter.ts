import "server-only";

import NewPost from "@/emails/new-post";
import { APP_NAME, SERVER_URL } from "@/lib/constants";
import { sendEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const unsubscribeUrl = (token: string) =>
  `${SERVER_URL}/unsubscribe?token=${encodeURIComponent(token)}`;

// RFC 8058 one-click unsubscribe, so mail apps show their own button
export const unsubscribeHeaders = (token: string) => ({
  "List-Unsubscribe": `<${SERVER_URL}/api/unsubscribe?token=${encodeURIComponent(token)}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

/*
 * Claims the post's announcement (notifiedAt is set once, atomically) and
 * returns whether this call won the claim. A post is only ever emailed once,
 * even if it's unpublished and published again.
 */
export async function claimAnnouncement(postId: string) {
  const { count } = await prisma.post.updateMany({
    where: { id: postId, status: "published", notifiedAt: null },
    data: { notifiedAt: new Date() },
  });

  return count === 1;
}

export async function announcePost(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      author: { select: { name: true } },
    },
  });

  if (!post) return;

  const subscribers = await prisma.subscriber.findMany({
    select: { email: true, token: true },
  });

  await sendEmails(
    subscribers.map((subscriber) => ({
      to: subscriber.email,
      subject: post.title,
      headers: unsubscribeHeaders(subscriber.token),
      react: NewPost({
        appName: APP_NAME,
        siteUrl: SERVER_URL,
        unsubscribeUrl: unsubscribeUrl(subscriber.token),
        post: {
          title: post.title,
          excerpt: post.excerpt,
          url: `${SERVER_URL}/blog/${post.slug}`,
          coverImage: post.coverImage,
          author: post.author.name,
        },
      }),
    })),
  );
}

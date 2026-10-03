import "server-only";

import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Callers must check requireAdmin() first; these read drafts and emails

const pageArgs = (page: number) => ({
  skip: (page - 1) * ADMIN_PAGE_SIZE,
  take: ADMIN_PAGE_SIZE,
});

const totalPages = (count: number) =>
  Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));

export async function getDashboardStats() {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);

  const [
    publishedCount,
    draftCount,
    views,
    commentCount,
    userCount,
    subscriberCount,
    recentPosts,
    recentComments,
    topPosts,
    monthlyPosts,
    monthlyComments,
  ] = await Promise.all([
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.comment.count(),
    prisma.user.count(),
    prisma.subscriber.count(),
    prisma.post.findMany({
      select: { id: true, title: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true } },
        post: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true, views: true },
      orderBy: { views: "desc" },
      take: 5,
    }),
    prisma.post.findMany({
      where: { status: "published", publishedAt: { gte: since } },
      select: { publishedAt: true },
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  // Last six months, oldest first, including months with nothing
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(since);
    date.setMonth(since.getMonth() + i);
    return date;
  });

  const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
  const countBy = (dates: Date[]) =>
    dates.reduce<Record<string, number>>((acc, date) => {
      acc[monthKey(date)] = (acc[monthKey(date)] ?? 0) + 1;
      return acc;
    }, {});

  const postsByMonth = countBy(
    monthlyPosts.flatMap((post) => (post.publishedAt ? [post.publishedAt] : [])),
  );
  const commentsByMonth = countBy(monthlyComments.map((c) => c.createdAt));

  const activity = months.map((date) => ({
    month: date.toLocaleString("en-US", { month: "short" }),
    posts: postsByMonth[monthKey(date)] ?? 0,
    comments: commentsByMonth[monthKey(date)] ?? 0,
  }));

  return {
    publishedCount,
    draftCount,
    totalViews: views._sum.views ?? 0,
    commentCount,
    userCount,
    subscriberCount,
    recentPosts,
    recentComments,
    topPosts,
    activity,
  };
}

export async function getAdminPosts({
  query,
  status,
  page,
}: {
  query?: string;
  status?: "draft" | "published";
  page: number;
}) {
  const where: Prisma.PostWhereInput = {
    ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
    ...(status ? { status } : {}),
  };

  const [posts, count] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        views: true,
        updatedAt: true,
        publishedAt: true,
        author: { select: { name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: "desc" },
      ...pageArgs(page),
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalPages: totalPages(count) };
}

export async function getPostForEdit(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { tags: { select: { id: true } } },
  });
}

export async function getAllTags() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdminComments({ page }: { page: number }) {
  const [comments, count] = await Promise.all([
    prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        post: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      ...pageArgs(page),
    }),
    prisma.comment.count(),
  ]);

  return { comments, totalPages: totalPages(count) };
}

export async function getAdminUsers({
  query,
  page,
}: {
  query?: string;
  page: number;
}) {
  const where: Prisma.UserWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, count] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      ...pageArgs(page),
    }),
    prisma.user.count({ where }),
  ]);

  return { users, totalPages: totalPages(count) };
}

export async function getSubscribers({ page }: { page: number }) {
  const [subscribers, count] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      ...pageArgs(page),
    }),
    prisma.subscriber.count(),
  ]);

  return { subscribers, totalPages: totalPages(count), count };
}

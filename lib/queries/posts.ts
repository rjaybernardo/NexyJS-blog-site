import "server-only";

import { PAGE_SIZE } from "@/lib/constants";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const cardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  publishedAt: true,
  author: { select: { name: true, image: true } },
  tags: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
} satisfies Prisma.PostSelect;

export type PostCardData = Prisma.PostGetPayload<{ select: typeof cardSelect }>;

const published = { status: "published" } satisfies Prisma.PostWhereInput;

export async function getPublishedPosts({
  query,
  tag,
  page = 1,
  limit = PAGE_SIZE,
}: {
  query?: string;
  tag?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.PostWhereInput = {
    ...published,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(tag ? { tags: { some: { slug: tag } } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { posts, totalPages: Math.max(1, Math.ceil(total / limit)), total };
}

export async function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { ...published, featured: true },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: { ...published, slug },
    include: {
      author: { select: { name: true, image: true, bio: true } },
      tags: { select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } },
    },
  });
}

export async function getRelatedPosts(postId: string, tagIds: string[]) {
  if (tagIds.length === 0) return [];

  return prisma.post.findMany({
    where: {
      ...published,
      id: { not: postId },
      tags: { some: { id: { in: tagIds } } },
    },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

export async function incrementPostViews(id: string) {
  await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

// Tags that have at least one published post, most used first
export async function getPopularTags(limit = 12) {
  const tags = await prisma.tag.findMany({
    where: { posts: { some: published } },
    select: {
      name: true,
      slug: true,
      _count: { select: { posts: { where: published } } },
    },
  });

  return tags
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, limit);
}

export async function getAllPublishedSlugs() {
  return prisma.post.findMany({
    where: published,
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}

import "dotenv/config";

import { hash } from "bcrypt-ts-edge";

import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/utils";

import { sampleComments, samplePosts, sampleTags } from "./sample-data";

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("Set SEED_ADMIN_PASSWORD (8+ characters) in .env before seeding");
  }

  // The admin is created or has its password reset; other data is only
  // added to an empty database, so re-running never duplicates posts
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin", password: await hash(adminPassword, 10) },
    create: {
      name: "Admin",
      email: adminEmail,
      role: "admin",
      password: await hash(adminPassword, 10),
      bio: "Writes about the web, design and the tools in between.",
    },
  });

  console.log(`Admin ready: ${admin.email}`);

  if ((await prisma.post.count()) > 0) {
    console.log("Posts already exist; skipping sample content.");
    return;
  }

  const tags = await Promise.all(
    sampleTags.map((name) =>
      prisma.tag.upsert({
        where: { slug: toSlug(name) },
        update: {},
        create: { name, slug: toSlug(name) },
      }),
    ),
  );
  const tagId = (name: string) => tags.find((tag) => tag.name === name)!.id;

  const reader = await prisma.user.upsert({
    where: { email: "reader@example.com" },
    update: {},
    create: {
      name: "Sam Reader",
      email: "reader@example.com",
      password: await hash(adminPassword, 10),
    },
  });

  for (const [index, sample] of samplePosts.entries()) {
    const { tags: postTags, daysAgo, ...post } = sample;
    const publishedAt = daysAgo === null ? null : new Date(Date.now() - daysAgo * DAY);

    const created = await prisma.post.create({
      data: {
        ...post,
        status: publishedAt ? "published" : "draft",
        publishedAt,
        views: publishedAt ? Math.round(1200 / (index + 1)) : 0,
        authorId: admin.id,
        tags: { connect: postTags.map((name) => ({ id: tagId(name) })) },
      },
    });

    if (publishedAt && index < sampleComments.length) {
      await prisma.comment.create({
        data: {
          postId: created.id,
          userId: reader.id,
          content: sampleComments[index],
          createdAt: new Date(publishedAt.getTime() + DAY),
        },
      });
    }
  }

  await prisma.subscriber.createMany({
    data: ["ana@example.com", "ben@example.com", "chris@example.com"].map((email) => ({ email })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${samplePosts.length} posts, ${tags.length} tags and sample comments.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

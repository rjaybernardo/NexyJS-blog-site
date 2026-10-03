import "dotenv/config";

import { createHash, randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../lib/generated/prisma/client";

// Everything the tests create uses these, so cleanup can find it
export const E2E_EMAIL_PREFIX = "e2e+";
export const E2E_SLUG_PREFIX = "e2e-";
export const E2E_TAG_PREFIX = "E2E ";

export const e2eEmail = (label: string) =>
  `${E2E_EMAIL_PREFIX}${label}-${Date.now()}@example.com`;

export function createTestDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set; e2e tests need the dev database");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export async function cleanUpE2eData(db: PrismaClient) {
  await db.post.deleteMany({ where: { slug: { startsWith: E2E_SLUG_PREFIX } } });
  await db.tag.deleteMany({ where: { name: { startsWith: E2E_TAG_PREFIX } } });
  await db.subscriber.deleteMany({ where: { email: { startsWith: E2E_EMAIL_PREFIX } } });
  await db.verificationToken.deleteMany({ where: { identifier: { contains: E2E_EMAIL_PREFIX } } });
  // Comments go with their user (onDelete: Cascade)
  await db.user.deleteMany({ where: { email: { startsWith: E2E_EMAIL_PREFIX } } });
  // Tests sign in many times from one IP; start each run with fresh limits
  await db.rateLimit.deleteMany({});
}

// A password-reset token the app will accept, as if it had been emailed
export async function createResetToken(db: PrismaClient, email: string) {
  const token = randomBytes(32).toString("hex");

  await db.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token: createHash("sha256").update(token).digest("hex"),
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return token;
}

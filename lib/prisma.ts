import "server-only";

import net from "node:net";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

/*
 * Node tries each resolved address for only 250 ms before moving on, which
 * is too short for a distant hosted database. Give each address 1s.
 */
net.setDefaultAutoSelectFamilyAttemptTimeout(1000);

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientClass: typeof PrismaClient | undefined;
};

/*
 * Dev keeps one client across hot reloads. After `prisma generate` the
 * PrismaClient class changes; a client cached from the old class lacks new
 * models (e.g. prisma.comment is undefined), so build a fresh one.
 */
const cached =
  globalForPrisma.prismaClientClass === PrismaClient
    ? globalForPrisma.prisma
    : undefined;

if (globalForPrisma.prisma && !cached) {
  void globalForPrisma.prisma.$disconnect().catch(() => {});
}

export const prisma =
  cached ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaClientClass = PrismaClient;
}

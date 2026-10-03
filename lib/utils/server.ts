import "server-only";

import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import { Prisma } from "@/lib/generated/prisma/client";

// Errors that point at a bug rather than bad input
const BUG_ERRORS = [TypeError, ReferenceError, SyntaxError, RangeError];

// Turns an error into a message safe to show, reporting unexpected ones
export function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(". ");
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    const field = Array.isArray(target)
      ? target[0]
      : typeof target === "string"
        ? target
        : "Field";
    const name = String(field).replace(/_idx$/, "").split("_").pop() ?? "Field";

    return `${name.charAt(0).toUpperCase()}${name.slice(1)} already exists`;
  }

  Sentry.captureException(error);

  // Don't show readers raw database or code error text
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError ||
    BUG_ERRORS.some((type) => error instanceof type)
  ) {
    console.error(error);
    return "Something went wrong. Please try again.";
  }

  return error instanceof Error ? error.message : "Something went wrong";
}

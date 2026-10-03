import "server-only";

import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

import { Prisma } from "@/lib/generated/prisma/client";

// Code bugs, as opposed to messages thrown on purpose ("Post not found")
const BUG_ERRORS = [TypeError, ReferenceError, RangeError, SyntaxError];

const isDatabaseError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError ||
  error instanceof Prisma.PrismaClientUnknownRequestError ||
  error instanceof Prisma.PrismaClientInitializationError ||
  error instanceof Prisma.PrismaClientValidationError;

const isDuplicate = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/*
 * Turns an error into a message safe to show. Server actions catch errors to
 * show that message, so Sentry would never see them: report the unexpected
 * ones (code bugs, database errors other than a duplicate value, non-Errors).
 */
export function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(". ");
  }

  if (isDuplicate(error)) {
    const target = error.meta?.target;
    const field = Array.isArray(target)
      ? target[0]
      : typeof target === "string"
        ? target
        : "Field";
    const name = String(field).replace(/_idx$/, "").split("_").pop() ?? "Field";

    return `${name.charAt(0).toUpperCase()}${name.slice(1)} already exists`;
  }

  if (
    !(error instanceof Error) ||
    isDatabaseError(error) ||
    BUG_ERRORS.some((type) => error instanceof type)
  ) {
    Sentry.captureException(error);
    console.error(error);

    // Don't show readers raw database or code error text
    return "Something went wrong. Please try again.";
  }

  return error.message;
}

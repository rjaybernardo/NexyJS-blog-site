import type { init } from "@sentry/nextjs";

/*
 * Shared Sentry settings for browser, server and edge.
 *
 * Privacy: the SDK collects cookies, request bodies, query values, database
 * parameters and local variables by default. Those can hold passwords and
 * emails, so collection is limited to what debugging needs.
 */
type SentryOptions = NonNullable<Parameters<typeof init>[0]>;

export const sentryDataCollection: SentryOptions["dataCollection"] = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { allow: ["user-agent", "content-type", "accept-language"] },
    response: false,
  },
  httpBodies: [],
  // Search filters and paging only
  urlQueryParams: {
    allow: ["q", "tag", "page", "status"],
  },
  databaseQueryData: false,
  stackFrameVariables: false,
  queues: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
};

export const sentryTracesSampleRate =
  process.env.NODE_ENV === "development" ? 1.0 : 0.1;

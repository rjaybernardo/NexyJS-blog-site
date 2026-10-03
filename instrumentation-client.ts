import * as Sentry from "@sentry/nextjs";

import {
  sentryDataCollection,
  sentryTracesSampleRate,
} from "./lib/sentry-options";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Error monitoring in the browser; does nothing until a DSN is configured
Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  // Reader data stays out of reports; see lib/sentry-options.ts.
  // Session Replay is off for the same reason: it would record what
  // readers type into forms.
  dataCollection: sentryDataCollection,
  tracesSampleRate: sentryTracesSampleRate,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

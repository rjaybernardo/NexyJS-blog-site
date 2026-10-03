import type { Metadata } from "next";

import UnsubscribeForm from "./unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

/*
 * A confirm button rather than unsubscribing on page load: email security
 * scanners open links in emails, which would unsubscribe people by accident.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4 py-24 text-center">
      <h1 className="font-serif text-4xl tracking-tight">Unsubscribe</h1>
      {token ? (
        <UnsubscribeForm token={token} />
      ) : (
        <p className="text-muted-foreground">
          This link is missing its token. Use the unsubscribe link from one of our emails.
        </p>
      )}
    </div>
  );
}

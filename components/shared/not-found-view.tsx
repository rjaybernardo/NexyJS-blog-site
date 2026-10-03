import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

/*
 * "Page not found". Inside the site layout there is already a <main>, so the
 * view is a plain section there; on its own it is the <main>.
 */
const NotFoundView = ({ as: Tag = "main" }: { as?: "main" | "section" }) => (
  <Tag
    aria-labelledby="not-found-title"
    className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center"
  >
    <p className="font-mono text-sm text-muted-foreground">404</p>
    <h1 id="not-found-title" className="mt-2 font-serif text-4xl tracking-tight">
      Page not found
    </h1>
    <p className="mt-3 text-muted-foreground">
      Sorry, we couldn&apos;t find the page you were looking for.
    </p>
    <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
      Back to home
    </Link>
  </Tag>
);

export default NotFoundView;

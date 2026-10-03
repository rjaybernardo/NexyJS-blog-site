import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Unauthorized" };

export default function UnauthorizedPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <h1 className="font-serif text-4xl tracking-tight">Admins only</h1>
      <p className="text-muted-foreground">You don&apos;t have permission to view this page.</p>
      <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-4" })}>
        Back to home
      </Link>
    </main>
  );
}

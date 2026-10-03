import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import ModeToggle from "@/components/shared/header/mode-toggle";
import UserButton from "@/components/shared/header/user-button";
import Logo from "@/components/shared/logo";
import { requireAdmin } from "@/lib/auth-guard";

import AdminNav from "./admin-nav";

export const metadata: Metadata = {
  title: { template: "%s | Dashboard", default: "Dashboard" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/30 md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b bg-background md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/admin" className="text-lg" />
          <div className="flex items-center gap-1 md:hidden">
            <ModeToggle />
            <UserButton />
          </div>
        </div>
        <AdminNav />
        <div className="hidden px-3 md:block">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLinkIcon className="size-4" /> View site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="hidden h-16 items-center justify-end gap-2 border-b bg-background px-8 md:flex">
          <ModeToggle />
          <UserButton />
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 space-y-6 p-4 outline-none md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

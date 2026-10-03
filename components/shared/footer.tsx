import Link from "next/link";
import { RssIcon } from "lucide-react";

import Logo from "@/components/shared/logo";
import NewsletterForm from "@/components/shared/newsletter-form";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

const Footer = () => (
  <footer className="mt-24 border-t">
    <div className="wrapper grid gap-10 py-12! md:grid-cols-2">
      <div className="space-y-3">
        <Logo />
        <p className="max-w-sm text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
      </div>

      <div className="space-y-3 md:justify-self-end">
        <h2 className="text-sm font-medium">Get new posts by email</h2>
        <NewsletterForm />
      </div>
    </div>

    <div className="wrapper flex flex-wrap items-center justify-between gap-4 border-t py-6! text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} {APP_NAME}
      </p>
      <nav aria-label="Footer" className="flex items-center gap-5">
        <Link href="/blog" className="hover:text-foreground">Blog</Link>
        <Link href="/tags" className="hover:text-foreground">Topics</Link>
        <Link href="/about" className="hover:text-foreground">About</Link>
        <a href="/feed.xml" className="flex items-center gap-1 hover:text-foreground">
          <RssIcon className="size-4" aria-hidden="true" /> RSS
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;

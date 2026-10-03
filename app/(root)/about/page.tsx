import type { Metadata } from "next";

import Markdown from "@/components/shared/markdown";
import NewsletterForm from "@/components/shared/newsletter-form";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

// Edit this text to describe your blog
const about = `
${APP_NAME} is a small, independent blog about building things for the web:
frameworks, design details, and the occasional detour.

Posts are written in **Markdown** and published from the built-in dashboard.
New posts go out by email to subscribers, and there's an [RSS feed](/feed.xml)
if you prefer a reader.
`;

export default function AboutPage() {
  return (
    <article className="prose-width py-10 md:py-16">
      <h1 className="font-serif text-5xl tracking-tight">About</h1>
      <div className="text-lg">
        <Markdown>{about}</Markdown>
      </div>
      <div className="mt-12 space-y-3 rounded-xl border p-6">
        <h2 className="font-medium">Subscribe</h2>
        <NewsletterForm />
      </div>
    </article>
  );
}

// Sample content for `npm run db:seed`. Covers are from Unsplash.

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const sampleTags = ["Next.js", "React", "Design", "CSS", "Databases", "Writing"];

export const samplePosts = [
  {
    title: "Why I moved this blog to Next.js 16",
    slug: "why-nextjs-16",
    excerpt:
      "Server components, server actions and a proxy file made the backend shrink to almost nothing. Here's what changed.",
    coverImage: unsplash("photo-1498050108023-c5249f4df085"),
    featured: true,
    tags: ["Next.js", "React"],
    daysAgo: 2,
    content: `The old version of this blog had a separate API, a separate admin app, and a build step that took longer than writing a post. This one is a single Next.js app.

## What got simpler

- **Reads** are plain async server components that query Postgres through Prisma.
- **Writes** are server actions. A form posts to a function; there is no API layer to keep in sync.
- **Auth** runs in \`proxy.ts\`, which replaced \`middleware.ts\`, so protected routes redirect before anything renders.

> The fastest code to maintain is the code you didn't have to write.

## A quick look at a server action

\`\`\`ts
export async function addComment(_prev: unknown, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Sign in to comment");
  // validate with zod, write with prisma, revalidate the page
}
\`\`\`

| Before | After |
| --- | --- |
| 3 deployments | 1 deployment |
| REST API + client fetches | Server components + actions |
| Hand-rolled admin | Built-in \`/admin\` dashboard |

That's most of it. The rest of this post series goes into each piece.`,
  },
  {
    title: "Designing a reading experience that gets out of the way",
    slug: "designing-for-reading",
    excerpt:
      "Line length, rhythm and contrast matter more than any animation. A few rules I follow for long-form text.",
    coverImage: unsplash("photo-1455390582262-044cdead277a"),
    featured: false,
    tags: ["Design", "Writing"],
    daysAgo: 6,
    content: `Most blog designs are built for the home page, not for the 2,000-word post someone actually came to read.

## Three rules

1. **Keep lines between 60 and 75 characters.** This site uses a \`44rem\` column.
2. **Give paragraphs room.** A line height around 1.7 for body text.
3. **Use one accent.** Everything else is a shade of the background.

### Task list for a new theme

- [x] Pick a serif for headings
- [x] Set the reading width
- [ ] Test in dark mode at night

Good typography is invisible. You only notice it when it's wrong.`,
  },
  {
    title: "Tailwind CSS v4: the parts I actually use",
    slug: "tailwind-v4-parts-i-use",
    excerpt:
      "CSS-first config, @utility, and theme variables. A short tour of the Tailwind v4 features that earned a place here.",
    coverImage: unsplash("photo-1507721999472-8ed4421c4af2"),
    featured: false,
    tags: ["CSS", "Design"],
    daysAgo: 12,
    content: `Tailwind v4 moved configuration into CSS. There's no \`tailwind.config.js\` in this project at all.

## Custom utilities

\`\`\`css
@utility prose-width {
  width: 100%;
  max-width: 44rem;
  margin-inline: auto;
}
\`\`\`

## Theme tokens

Colors are CSS variables in \`globals.css\`, and dark mode swaps them under a \`.dark\` class set by **next-themes**. Components never mention a specific color, only roles like \`bg-muted\` and \`text-muted-foreground\`.`,
  },
  {
    title: "Prisma 7 with the Postgres driver adapter",
    slug: "prisma-7-driver-adapter",
    excerpt:
      "The new prisma-client generator, driver adapters and prisma.config.ts — what the setup looks like now.",
    coverImage: unsplash("photo-1544383835-bda2bc66a55d"),
    featured: false,
    tags: ["Databases", "Next.js"],
    daysAgo: 20,
    content: `Prisma 7 generates the client into your source tree and talks to Postgres through a driver adapter.

\`\`\`ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
\`\`\`

Connection settings moved to \`prisma.config.ts\`, which is also where the seed command lives. Migrations use a direct connection, the app uses the pooled one.`,
  },
  {
    title: "Writing in Markdown, publishing from a dashboard",
    slug: "markdown-workflow",
    excerpt:
      "Draft anywhere, import the .md file, preview, publish. How the editor on this blog handles Markdown.",
    coverImage: unsplash("photo-1517842645767-c639042777db"),
    featured: false,
    tags: ["Writing"],
    daysAgo: 33,
    content: `I write drafts in a plain text editor. The dashboard's **Import .md** button reads the file, including front matter:

\`\`\`markdown
---
title: My new post
excerpt: One sentence about it
tags: [Writing, Design]
draft: true
---

The post starts here.
\`\`\`

Title, excerpt, slug and tags fill in automatically. The **Preview** tab renders exactly what readers will see, tables and all.`,
  },
  {
    title: "Notes on React 19 forms",
    slug: "react-19-forms",
    excerpt:
      "useActionState and form actions remove most of the boilerplate around submitting data. Some patterns that work well.",
    coverImage: null,
    featured: false,
    tags: ["React"],
    daysAgo: 47,
    content: `React 19 lets a \`<form>\` take a function as its \`action\`.

\`\`\`tsx
const [state, action, pending] = useActionState(subscribe, null);

return (
  <form action={action}>
    <input name="email" type="email" required />
    <button disabled={pending}>Subscribe</button>
  </form>
);
\`\`\`

The pending state, the result and progressive enhancement all come for free. For bigger forms, like the post editor here, **react-hook-form** with a **zod** resolver still earns its place.`,
  },
  {
    title: "Draft: ideas for the next series",
    slug: "draft-next-series",
    excerpt: "An unpublished draft, so the dashboard has something in the Drafts filter.",
    coverImage: null,
    featured: false,
    tags: ["Writing"],
    daysAgo: null,
    content: `Possible topics:

- Search with Postgres full-text indexes
- Sending a newsletter when a post is published
- Image optimization for user-uploaded covers`,
  },
];

export const sampleComments = [
  "This was exactly the overview I needed, thanks for writing it up.",
  "Do you have a repo with the full setup? Would love to see the proxy file.",
  "The table comparing before/after is great. Saving this.",
  "Line length is so underrated. Good post.",
];

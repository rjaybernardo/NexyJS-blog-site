# The Notebook — Next.js 16 blog

A minimal, two-tone blog with a full backend and an admin dashboard. Posts are
written in Markdown, stored in Postgres, and managed from `/admin`.

## Features

**Public site**

- Home page with a featured post, latest posts and popular topics
- `/blog` listing with search across titles and content (`?q=`), topic filter (`?tag=`) and pagination
- Post pages rendered from Markdown (GitHub-flavored: tables, task lists, code blocks), with reading time, related posts and comments
- Topics page, About page, newsletter sign-up (welcome email via Resend)
- Sign up / sign in with email + password, or Google (optional)
- Light / dark / system theme
- SEO: per-post metadata and Open Graph, `sitemap.xml`, `robots.txt`, RSS at `/feed.xml`

**Admin dashboard (`/admin`, admins only)**

- **Overview** — published/draft counts, total views, comments, users, subscribers, a six-month activity chart, most-read posts, recent edits and comments
- **Posts** — search, filter by status, publish/unpublish, edit, delete
- **Editor** — Markdown with toolbar, live preview, word count, `Import .md` (reads front matter), cover image upload (UploadThing) or URL, tags, featured flag
- **Tags**, **Comments** (moderation), **Users** (change role, delete), **Subscribers** (list, delete, CSV export)

## Tech stack

Same toolchain as [nextjs-rgb-leather](https://github.com/rjaybernardo/nextjs-rgb-leather), without the store parts:

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, server actions, `proxy.ts`), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (Base UI, `base-vega` style), lucide-react, next-themes, sonner |
| Data | PostgreSQL, Prisma 7 with `@prisma/adapter-pg` |
| Auth | Auth.js v5 (`next-auth@5` beta) with Prisma adapter, credentials (bcrypt) + Google |
| Forms | react-hook-form, zod, `@hookform/resolvers` |
| Content | react-markdown, remark-gfm, slugify |
| Uploads | UploadThing |
| Email | Resend, React Email |
| Charts | recharts |
| Monitoring | Sentry |
| Testing | Vitest (unit), Playwright (end-to-end) |

## Requirements

- Node.js 22+ and npm
- A PostgreSQL database (local, or hosted such as [Neon](https://neon.tech), Supabase, Railway)

## Getting started

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Create your environment file and fill it in (see below)
cp .env.example .env

# 3. Create the database tables
npx prisma migrate dev

# 4. Create the admin account and sample posts
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000, then sign in at `/sign-in` with `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` and go to http://localhost:3000/admin.

The seed also creates a reader account, `reader@example.com`, with the same
password as the admin. Re-running the seed resets the admin password but never
duplicates posts (sample content is only added to an empty database).

## Environment variables (`.env`)

Example `.env` for local development:

```bash
# --- Required ---------------------------------------------------------------
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog"
DIRECT_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blog"
AUTH_SECRET="paste-output-of-npx-auth-secret"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# --- Needed for cover image uploads -----------------------------------------
UPLOADTHING_TOKEN="your-uploadthing-token"

# --- Seed (npm run db:seed) -------------------------------------------------
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="change-me-please"

# --- Optional ---------------------------------------------------------------
NEXT_PUBLIC_APP_NAME="The Notebook"
NEXT_PUBLIC_APP_DESCRIPTION="Notes on building for the web, written slowly."
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
RESEND_API_KEY=""
EMAIL_FROM="The Notebook <hello@yourdomain.com>"
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
# AUTH_TRUST_HOST=true
```

| Variable | Required | What it's for / where to get it |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string the app uses. With Neon, use the **pooled** URL. |
| `DIRECT_DATABASE_URL` | Yes* | Direct (non-pooled) URL used by `prisma migrate`. Same as `DATABASE_URL` for a local database. *Falls back to `DATABASE_URL` if unset. |
| `AUTH_SECRET` | Yes | Signs session cookies. Generate with `npx auth secret` or `openssl rand -base64 32`. Changing it signs everyone out. |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Public URL of the site, no trailing slash. Used for metadata, sitemap, RSS and email links. |
| `UPLOADTHING_TOKEN` | For uploads | Create an app at [uploadthing.com](https://uploadthing.com) → API Keys. Without it, paste image URLs into the editor instead. |
| `SEED_ADMIN_EMAIL` | For seeding | Admin login created by `npm run db:seed` (default `admin@example.com`). |
| `SEED_ADMIN_PASSWORD` | For seeding | Admin password, 8+ characters. The seed refuses to run without it. |
| `NEXT_PUBLIC_APP_NAME` | No | Blog name in the header, titles and RSS. Default "The Notebook". |
| `NEXT_PUBLIC_APP_DESCRIPTION` | No | Tagline shown on the home page and in metadata. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google sign-in. Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with redirect URI `{NEXT_PUBLIC_SERVER_URL}/api/auth/callback/google`. The button appears once both are set. |
| `RESEND_API_KEY` | No | Sends the subscriber welcome email via [resend.com](https://resend.com). Without it, emails are printed to the server log. |
| `EMAIL_FROM` | No | Sender address, e.g. `Blog <hello@yourdomain.com>`. Must be a domain verified in Resend. |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Error reporting via [sentry.io](https://sentry.io). Monitoring is off until set. |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | No | Upload source maps during `npm run build` so Sentry stack traces show your code. |
| `AUTH_TRUST_HOST` | No | Set to `true` when running `next start` yourself behind a proxy (not needed on Vercel). |

Note: `NEXT_PUBLIC_*` values are baked in at build time. Rebuild after changing them.

### Running Postgres locally

Any Postgres 14+ works. For example, with Docker:

```bash
docker run --name blog-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=blog -p 5432:5432 -d postgres:17
```

Then use `postgresql://postgres:postgres@localhost:5432/blog` for both database URLs.

## Making someone an admin

New sign-ups are regular users (they can comment). To promote someone, sign in
as an admin and change their role under **Dashboard → Users**. The first admin
comes from the seed script.

## Writing posts

Write in the dashboard editor, or draft in any text editor and use **Import .md**.
Front matter is optional:

```markdown
---
title: My new post
slug: my-new-post
excerpt: One sentence that shows on the post card
tags: [Next.js, Design]   # must match existing tag names
cover: https://images.unsplash.com/photo-...
featured: false
draft: true
---

The post body in Markdown...
```

Raw HTML in Markdown is not rendered, so posts can't inject scripts. Images in
posts may come from any HTTPS host; cover images from UploadThing and
`images.unsplash.com` are optimized by `next/image` (add more hosts in
`next.config.ts` → `images.remotePatterns` and `lib/utils.ts`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright; needs a seeded DB, starts the dev server). First run: `npx playwright install chromium` |
| `npm run db:seed` | Create the admin and sample content |
| `npx prisma migrate dev` | Apply/create migrations in development |
| `npx prisma migrate deploy` | Apply migrations in production |
| `npx prisma studio` | Browse the database |

## Project structure

```
app/
  (root)/        public site: home, blog, blog/[slug], tags, about, account
  (auth)/        sign-in, sign-up
  admin/         dashboard: overview, posts, tags, comments, users, subscribers
  api/           Auth.js and UploadThing handlers
  feed.xml/      RSS feed
components/      ui/ (shadcn), shared/ (site), admin/ (dashboard)
lib/
  actions/       server actions (all writes; admin ones check the role)
  queries/       server-only reads
  validators.ts  zod schemas shared by forms and actions
prisma/          schema and migrations
db/              seed script and sample posts
emails/          React Email templates
tests/           unit/ (Vitest) and e2e/ (Playwright)
proxy.ts         redirects signed-out visitors away from /admin and /account
```

## Deploying (Vercel)

1. Create a hosted Postgres database and run `npx prisma migrate deploy` against it (and `npm run db:seed` once for the admin).
2. Import the repo in Vercel and add the environment variables above, with `NEXT_PUBLIC_SERVER_URL` set to your real domain.
3. If you use Google sign-in, add the production callback URL to your OAuth client.

## Theme

The design uses two colors only. Change them in `app/globals.css`:

```css
:root { --ink: #161616; --paper: #f6f5f1; }
.dark { --ink: #f6f5f1; --paper: #161616; }
```

Every other shade (borders, muted text, chart bars) is mixed from those two.

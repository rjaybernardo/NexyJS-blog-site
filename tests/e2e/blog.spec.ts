import { expect, test } from "@playwright/test";

// Public pages; needs a seeded database (npm run db:seed)

test("home page lists posts and opens one", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Why I moved this blog to Next.js 16" }).first().click();
  await expect(page).toHaveURL(/\/blog\/why-nextjs-16$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why I moved this blog to Next.js 16");
  // Markdown rendered: a table and a code block from the sample post
  await expect(page.locator("article table")).toBeVisible();
  await expect(page.locator("article pre")).toBeVisible();
});

test("search and topic filters narrow the list", async ({ page }) => {
  await page.goto("/blog?q=driver+adapter");
  await expect(page.getByRole("link", { name: /Prisma 7/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Designing a reading experience/ })).toHaveCount(0);

  await page.goto("/blog");
  await page.getByRole("navigation", { name: "Topics" }).getByRole("link", { name: "React" }).click();
  await expect(page).toHaveURL(/tag=react/);
  await expect(page.getByRole("heading", { level: 1, name: "React" })).toBeVisible();
});

test("header search goes to results", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search posts" }).first();
  await search.fill("tailwind");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/blog\?q=tailwind/);
  await expect(page.getByRole("link", { name: /Tailwind CSS v4/ }).first()).toBeVisible();
});

test("missing and draft posts return 404", async ({ request }) => {
  expect((await request.get("/blog/does-not-exist")).status()).toBe(404);
  expect((await request.get("/blog/draft-next-series")).status()).toBe(404);
});

test("feeds, sitemap and share images work", async ({ page, request }) => {
  const feed = await request.get("/feed.xml");
  expect(feed.ok()).toBe(true);
  expect(await feed.text()).toContain("<title>Why I moved this blog to Next.js 16</title>");

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/blog/why-nextjs-16");
  expect(await sitemap.text()).not.toContain("draft-next-series");

  // Next adds a hash to the generated image's URL, so read it from the page
  await page.goto("/blog/why-nextjs-16");
  const ogUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
  const og = await request.get(new URL(ogUrl!).pathname + new URL(ogUrl!).search);
  expect(og.headers()["content-type"]).toBe("image/png");

  const icon = await request.get("/icon");
  expect(icon.ok()).toBe(true);
});

test("dashboard and account require sign in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fadmin/);

  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Faccount/);
});

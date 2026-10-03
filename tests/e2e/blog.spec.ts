import { expect, test } from "@playwright/test";

// Needs a seeded database (npm run db:seed)

test("home page lists posts and opens one", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Why I moved this blog to Next.js 16" }).first().click();
  await expect(page).toHaveURL(/\/blog\/why-nextjs-16$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why I moved this blog to Next.js 16");
});

test("search finds posts", async ({ page }) => {
  await page.goto("/blog?q=prisma");
  await expect(page.getByRole("link", { name: /Prisma 7/ }).first()).toBeVisible();
});

test("dashboard requires sign in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fadmin/);
});

test("admin can sign in and see the dashboard", async ({ page }) => {
  const password = process.env.SEED_ADMIN_PASSWORD;
  test.skip(!password, "SEED_ADMIN_PASSWORD not set");

  await page.goto("/sign-in?callbackUrl=/admin");
  await page.getByLabel("Email").fill(process.env.SEED_ADMIN_EMAIL || "admin@example.com");
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

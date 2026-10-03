import { expect, test } from "@playwright/test";

import { createTestDb, E2E_SLUG_PREFIX, E2E_TAG_PREFIX, e2eEmail } from "./db";
import { ADMIN_PASSWORD, adminPage } from "./helpers";

const db = createTestDb();
test.afterAll(() => db.$disconnect());

test.skip(!ADMIN_PASSWORD, "SEED_ADMIN_PASSWORD not set");

test("admin writes, previews, publishes and deletes a post", async ({ browser }) => {
  const page = await adminPage(browser);
  const tag = `${E2E_TAG_PREFIX}${Date.now()}`;
  const slug = `${E2E_SLUG_PREFIX}${Date.now()}`;
  const title = `E2E post ${Date.now()}`;

  // A tag to attach
  await page.goto("/admin/tags");
  await page.getByLabel("Tag name").fill(tag);
  await page.getByRole("button", { name: "Add tag" }).click();
  await expect(page.getByText(tag, { exact: true })).toBeVisible();

  // Draft with Markdown, checked in the preview tab
  await page.goto("/admin/posts/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Excerpt").fill("A post written by the end-to-end tests.");
  await page.getByLabel("Content (Markdown)").fill("## Section\n\nSome **bold** text.\n\n| a | b |\n| - | - |\n| 1 | 2 |");
  await page.getByRole("button", { name: tag }).click();
  await page.getByRole("tab", { name: "preview" }).click();
  await expect(page.getByRole("heading", { name: "Section" })).toBeVisible();
  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}$/);

  // Admins can preview the draft; it's hidden from everyone else
  await page.goto(`/blog/${slug}`);
  await expect(page.getByText("Draft preview.")).toBeVisible();
  await page.getByRole("link", { name: "Edit" }).click();

  // Publish without emailing subscribers
  await page.getByRole("radio", { name: "published" }).click();
  await page.getByRole("checkbox", { name: /^Email \d+ subscribers? when published$/ }).click();
  await page.getByRole("button", { name: "Save & publish" }).click();
  await expect(page.getByText("Post saved", { exact: true })).toBeVisible();
  expect((await db.post.findUniqueOrThrow({ where: { slug } })).notifiedAt).toBeNull();

  await page.goto(`/blog/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
  await expect(page.getByRole("link", { name: tag })).toBeVisible();

  // Unpublish and delete from the list
  await page.goto(`/admin/posts?q=${encodeURIComponent(title)}`);
  const row = page.getByRole("row").filter({ hasText: title });
  await row.getByRole("button", { name: "Unpublish" }).click();
  await expect(row.getByText("draft")).toBeVisible();
  await row.getByRole("button", { name: "Delete post" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("No posts found.")).toBeVisible();
});

test("publishing emails subscribers once", async ({ browser }) => {
  const page = await adminPage(browser);
  const slug = `${E2E_SLUG_PREFIX}notify-${Date.now()}`;
  await db.subscriber.create({ data: { email: e2eEmail("notify") } });

  await page.goto("/admin/posts/new");
  await page.getByLabel("Title").fill("E2E announced post");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Excerpt").fill("This one is emailed to subscribers.");
  await page.getByLabel("Content (Markdown)").fill("Content for the announced post.");
  await page.getByRole("radio", { name: "published" }).click();
  await page.getByRole("button", { name: "Publish post" }).click();
  await expect(page.getByText("Subscribers are being emailed.")).toBeVisible();

  await expect(page.getByText(/Subscribers were emailed on/)).toBeVisible();
  expect((await db.post.findUniqueOrThrow({ where: { slug } })).notifiedAt).not.toBeNull();
});

test("dashboard pages load and subscribers export", async ({ browser }) => {
  const page = await adminPage(browser);

  for (const [path, heading] of [
    ["/admin/posts", "Posts"],
    ["/admin/tags", "Tags"],
    ["/admin/comments", "Comments"],
    ["/admin/users", "Users"],
    ["/admin/subscribers", "Subscribers"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(/^subscribers-\d{4}-\d{2}-\d{2}\.csv$/);
});

// Each user gets their own browser context: swapping cookies within one page
// races with Auth.js refreshing the session cookie on in-flight responses
test("non-admins can't open the dashboard until promoted", async ({ browser }) => {
  const email = e2eEmail("plain");
  const reader = await (await browser.newContext()).newPage();

  await reader.goto("/sign-up");
  await reader.getByLabel("Name").fill("E2E Plain");
  await reader.getByLabel("Email").fill(email);
  await reader.getByLabel("Password", { exact: true }).fill("plain-password");
  await reader.getByLabel("Confirm password").fill("plain-password");
  await reader.getByRole("button", { name: "Create account" }).click();
  await expect(reader).not.toHaveURL(/sign-up/);

  await reader.goto("/admin");
  await expect(reader.getByRole("heading", { name: "Admins only" })).toBeVisible();

  const admin = await adminPage(browser);
  await admin.goto(`/admin/users?q=${encodeURIComponent(email)}`);
  await admin.getByRole("combobox", { name: "Role" }).selectOption("admin");
  await expect(admin.getByText("Role changed to admin")).toBeVisible();

  // The role is checked against the database, so no new sign-in is needed
  await reader.goto("/admin");
  await expect(reader.getByRole("heading", { name: "Overview" })).toBeVisible();

  await reader.context().close();
  await admin.context().close();
});

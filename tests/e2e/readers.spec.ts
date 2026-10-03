import { expect, test } from "@playwright/test";

import { createResetToken, createTestDb, e2eEmail } from "./db";
import { signIn, signOut } from "./helpers";

const db = createTestDb();
test.afterAll(() => db.$disconnect());

test("reader signs up, comments, edits profile and changes password", async ({ page }) => {
  const email = e2eEmail("reader");

  await page.goto("/sign-up?callbackUrl=/blog/why-nextjs-16");
  await page.getByLabel("Name").fill("E2E Reader");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("first-password");
  await page.getByLabel("Confirm password").fill("first-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/blog\/why-nextjs-16$/);

  // Comment, then delete it
  const comment = `E2E comment ${Date.now()}`;
  await page.getByRole("textbox", { name: "Comment" }).fill(comment);
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText(comment)).toBeVisible();

  await page.getByRole("listitem").filter({ hasText: comment }).getByRole("button", { name: "Delete comment" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(comment)).toHaveCount(0);

  // Profile name shows in the account menu after saving
  await page.goto("/account");
  await page.getByLabel("Name").fill("E2E Renamed");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Profile updated")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Open account menu" }).first().click();
  await expect(page.getByRole("menu").getByText("E2E Renamed")).toBeVisible();
  await page.keyboard.press("Escape");

  // Change password, then sign in with the new one
  await page.getByLabel("Current password").fill("first-password");
  await page.getByLabel("New password", { exact: true }).fill("second-password");
  await page.getByLabel("Confirm new password").fill("second-password");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("Password updated")).toBeVisible();

  await signOut(page);
  await signIn(page, email, "second-password");
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});

test("password reset", async ({ page }) => {
  const email = e2eEmail("reset");
  await db.user.create({ data: { name: "E2E Reset", email } });

  // The request form never says whether the account exists
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If an account uses that email")).toBeVisible();

  const token = await createResetToken(db, email);
  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel("New password", { exact: true }).fill("brand-new-password");
  await page.getByLabel("Confirm new password").fill("brand-new-password");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("Password updated. Sign in with your new password.")).toBeVisible();

  await signIn(page, email, "brand-new-password");

  // A used link doesn't work twice
  await signOut(page);
  await page.goto(`/reset-password?token=${token}`);
  await page.getByLabel("New password", { exact: true }).fill("another-password");
  await page.getByLabel("Confirm new password").fill("another-password");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("invalid or has expired")).toBeVisible();
});

test("newsletter subscribe and unsubscribe", async ({ page, request }) => {
  const email = e2eEmail("subscriber");

  await page.goto("/about");
  await page.getByRole("main").getByLabel("Email address").fill(email);
  await page.getByRole("main").getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByText("You're on the list")).toBeVisible();

  const subscriber = await db.subscriber.findUniqueOrThrow({ where: { email } });

  await page.goto(`/unsubscribe?token=${subscriber.token}`);
  await page.getByRole("button", { name: "Unsubscribe" }).click();
  await expect(page.getByText("You've been unsubscribed.")).toBeVisible();
  expect(await db.subscriber.findUnique({ where: { email } })).toBeNull();

  // One-click unsubscribe used by mail apps
  const again = await db.subscriber.create({ data: { email } });
  const response = await request.post(`/api/unsubscribe?token=${again.token}`);
  expect(response.ok()).toBe(true);
  expect(await db.subscriber.findUnique({ where: { email } })).toBeNull();
});

import { type Browser, expect, type Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "";

export async function signIn(page: Page, email: string, password: string, callbackUrl = "/") {
  await page.goto(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).not.toHaveURL(/\/sign-in/);
}

export async function signInAsAdmin(page: Page) {
  await signIn(page, ADMIN_EMAIL, ADMIN_PASSWORD, "/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Open account menu" }).first().click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
}

type StorageState = Awaited<ReturnType<ReturnType<Page["context"]>["storageState"]>>;
let adminState: StorageState | null = null;

/*
 * A page signed in as the admin. Signs in once per worker and reuses the
 * session, since sign-in is rate limited to 5 attempts per email.
 */
export async function adminPage(browser: Browser) {
  if (!adminState) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await signInAsAdmin(page);
    adminState = await context.storageState();
    await context.close();
  }

  const context = await browser.newContext({ storageState: adminState });
  return context.newPage();
}

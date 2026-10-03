import { describe, expect, it } from "vitest";

import { postSchema, signUpFormSchema } from "@/lib/validators";

const validPost = {
  title: "A post",
  slug: "a-post",
  excerpt: "A short summary of the post.",
  content: "Some markdown content that is long enough.",
  coverImage: null,
  status: "draft" as const,
  featured: false,
  tagIds: [],
};

describe("postSchema", () => {
  it("accepts a valid post", () => {
    expect(postSchema.safeParse(validPost).success).toBe(true);
  });

  it("rejects bad slugs", () => {
    expect(postSchema.safeParse({ ...validPost, slug: "Bad Slug" }).success).toBe(false);
    expect(postSchema.safeParse({ ...validPost, slug: "trailing-" }).success).toBe(false);
  });
});

describe("signUpFormSchema", () => {
  it("requires matching passwords", () => {
    const result = signUpFormSchema.safeParse({
      name: "Sam",
      email: "SAM@Example.com",
      password: "password1",
      confirmPassword: "password2",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes email", () => {
    const result = signUpFormSchema.parse({
      name: "Sam",
      email: " SAM@Example.com ",
      password: "password1",
      confirmPassword: "password1",
    });

    expect(result.email).toBe("sam@example.com");
  });
});

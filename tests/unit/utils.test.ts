import { describe, expect, it } from "vitest";

import { canOptimizeImage, getSafeCallbackUrl, parsePage, readingTime, toSlug } from "@/lib/utils";

describe("toSlug", () => {
  it("lowercases and dashes words", () => {
    expect(toSlug("Hello World: Next.js 16!")).toBe("hello-world-nextjs-16");
  });
});

describe("readingTime", () => {
  it("is at least one minute", () => {
    expect(readingTime("just a few words")).toBe(1);
  });

  it("counts ~220 words per minute", () => {
    expect(readingTime("word ".repeat(1100))).toBe(5);
  });
});

describe("getSafeCallbackUrl", () => {
  it("keeps same-site paths", () => {
    expect(getSafeCallbackUrl("/blog/post?x=1#c")).toBe("/blog/post?x=1#c");
  });

  it("drops other origins", () => {
    expect(getSafeCallbackUrl("https://evil.com/steal")).toBe("/steal");
    expect(getSafeCallbackUrl("//evil.com")).toBe("/");
    expect(getSafeCallbackUrl("javascript:alert(1)")).toBe("/");
    expect(getSafeCallbackUrl(undefined)).toBe("/");
  });
});

describe("parsePage", () => {
  it("falls back to 1 for invalid input", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });
});

describe("canOptimizeImage", () => {
  it("allows configured hosts only", () => {
    expect(canOptimizeImage("https://utfs.io/f/abc")).toBe(true);
    expect(canOptimizeImage("https://images.unsplash.com/photo")).toBe(true);
    expect(canOptimizeImage("https://example.com/a.png")).toBe(false);
    expect(canOptimizeImage("/local.png")).toBe(true);
  });
});

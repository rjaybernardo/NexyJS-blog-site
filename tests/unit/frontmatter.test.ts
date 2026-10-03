import { describe, expect, it } from "vitest";

import { excerptFrom, parseFrontMatter } from "@/lib/frontmatter";

describe("parseFrontMatter", () => {
  it("reads strings, booleans and inline lists", () => {
    const { data, content } = parseFrontMatter(
      `---\ntitle: "Hello: world"\ndraft: true\ntags: [Next.js, 'React']\n---\n\nBody here`,
    );

    expect(data).toEqual({ title: "Hello: world", draft: true, tags: ["Next.js", "React"] });
    expect(content.trim()).toBe("Body here");
  });

  it("reads dash lists", () => {
    const { data } = parseFrontMatter(`---\ntags:\n  - one\n  - two\nslug: x\n---\n`);

    expect(data).toEqual({ tags: ["one", "two"], slug: "x" });
  });

  it("returns the source unchanged without front matter", () => {
    expect(parseFrontMatter("# Title\n\nText")).toEqual({ data: {}, content: "# Title\n\nText" });
  });
});

describe("excerptFrom", () => {
  it("strips markdown and truncates", () => {
    const text = excerptFrom("## Heading\n\nSome **bold** and a [link](https://x.y).\n\n```js\ncode\n```", 30);

    expect(text).toBe("Heading Some bold and a link.");
    expect(excerptFrom("word ".repeat(100), 20).endsWith("…")).toBe(true);
  });
});

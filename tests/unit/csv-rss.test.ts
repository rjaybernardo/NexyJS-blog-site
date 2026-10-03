import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/csv";
import { buildRss } from "@/lib/rss";

describe("toCsv", () => {
  it("quotes and guards formula cells", () => {
    expect(toCsv([["a,b", '=SUM(A1)', 'say "hi"']])).toBe(`"a,b",'=SUM(A1),"say ""hi"""`);
  });
});

describe("buildRss", () => {
  it("escapes XML", () => {
    const xml = buildRss({
      title: "Blog & co",
      description: "<desc>",
      siteUrl: "https://x.y",
      items: [],
    });

    expect(xml).toContain("<title>Blog &amp; co</title>");
    expect(xml).toContain("&lt;desc&gt;");
  });
});

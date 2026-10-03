const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

type FeedItem = {
  title: string;
  url: string;
  description: string;
  publishedAt: Date;
  author: string;
  categories: string[];
};

export function buildRss({
  title,
  description,
  siteUrl,
  items,
}: {
  title: string;
  description: string;
  siteUrl: string;
  items: FeedItem[];
}) {
  const entries = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.publishedAt.toUTCString()}</pubDate>
      <dc:creator>${escapeXml(item.author)}</dc:creator>
${item.categories.map((c) => `      <category>${escapeXml(c)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>`;
}

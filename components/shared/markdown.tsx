import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { toSlug } from "@/lib/utils";

// Heading text as a plain string, for anchor ids
const textOf = (node: React.ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : node && typeof node === "object" && "props" in node
        ? textOf((node.props as { children?: React.ReactNode }).children)
        : "";

const heading =
  (Tag: "h2" | "h3" | "h4", className: string) =>
  // eslint-disable-next-line react/display-name
  ({ children }: { children?: React.ReactNode }) => (
    <Tag id={toSlug(textOf(children))} className={`scroll-mt-24 ${className}`}>
      {children}
    </Tag>
  );

/*
 * Tailwind styling for Markdown posts (GitHub-flavored: tables, task lists,
 * strikethrough, autolinks). Raw HTML in the source is not rendered
 * (react-markdown default), so posts can't inject scripts. A post's own "#"
 * headings become h2, since the page title is the h1.
 */
const components: Components = {
  h1: heading("h2", "mt-12 font-serif text-3xl tracking-tight"),
  h2: heading("h2", "mt-12 font-serif text-3xl tracking-tight"),
  h3: heading("h3", "mt-8 text-xl font-semibold"),
  h4: heading("h4", "mt-6 text-lg font-semibold"),
  p: ({ children }) => <p className="mt-5 leading-8">{children}</p>,
  ul: ({ children, className }) => (
    <ul
      className={
        className?.includes("contains-task-list")
          ? "mt-5 space-y-2"
          : "mt-5 list-disc space-y-2 pl-6 marker:text-muted-foreground"
      }
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-8 [&>input]:mr-2">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-foreground/20 pl-5 font-serif text-xl italic text-muted-foreground [&>p]:mt-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-12" />,
  a: ({ href = "", children }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} className="font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">
        {children}
      </Link>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
      >
        {children}
      </a>
    ),
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // Post images can come from any host, so next/image isn't used
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="mt-6 w-full rounded-lg border" />
    ) : null,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b bg-muted/50 px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-b px-3 py-2">{children}</td>,
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-sm leading-6 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]">{children}</code>
  ),
};

const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
    {children}
  </ReactMarkdown>
);

export default Markdown;

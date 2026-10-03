/*
 * Minimal YAML front matter for imported Markdown files:
 *
 *   ---
 *   title: Hello world
 *   tags: [nextjs, react]    (or "tags: nextjs, react", or a "- item" list)
 *   draft: true
 *   ---
 *
 * Only flat key/value pairs and string lists; enough for blog metadata
 * without pulling in a YAML parser.
 */
export type FrontMatter = Record<string, string | string[] | boolean>;

const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, "$2");

function parseValue(raw: string): string | string[] | boolean {
  const value = raw.trim();

  if (value === "true") return true;
  if (value === "false") return false;

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map(unquote)
      .filter(Boolean);
  }

  return unquote(value);
}

export function parseFrontMatter(source: string): { data: FrontMatter; content: string } {
  const match = source.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) return { data: {}, content: source };

  const data: FrontMatter = {};
  let listKey: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^\s+-\s+(.*)$/);

    if (item && listKey) {
      const list = Array.isArray(data[listKey]) ? (data[listKey] as string[]) : [];
      data[listKey] = [...list, unquote(item[1])];
      continue;
    }

    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!pair) continue;

    const [, key, value] = pair;
    listKey = value.trim() === "" ? key : null;
    data[key] = value.trim() === "" ? [] : parseValue(value);
  }

  return { data, content: source.slice(match[0].length) };
}

// Strips Markdown syntax for a plain-text excerpt
export function excerptFrom(markdown: string, length = 200) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

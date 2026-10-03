import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toSlug = (value: string) =>
  slugify(value, { lower: true, strict: true, trim: true });

// Minutes to read at ~220 words per minute, never less than one
export function readingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(words / 220));
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNumber(number: number): string {
  return NUMBER_FORMATTER.format(number);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(date: Date | string) {
  return DATE_FORMATTER.format(new Date(date));
}

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
      skipEmptyString: true,
    },
  );
}

// Reduce a callbackUrl to a same-site path to prevent open redirects
export const getSafeCallbackUrl = (value: unknown) => {
  if (typeof value !== "string" || value.length === 0) return "/";

  let url: URL;

  try {
    url = new URL(value, "http://localhost");
  } catch {
    return "/";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return "/";

  // Collapse leading slashes so "//evil.com" can't become a protocol-relative URL
  return `${url.pathname.replace(/^\/+/, "/")}${url.search}${url.hash}`;
};

// Page number from a search param, at least 1
export const parsePage = (value: unknown) => {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
};

// Hosts in next.config.ts images.remotePatterns; others skip optimization
const OPTIMIZED_IMAGE_HOSTS = [/^utfs\.io$/, /\.ufs\.sh$/, /^images\.unsplash\.com$/];

export function canOptimizeImage(src: string) {
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && OPTIMIZED_IMAGE_HOSTS.some((host) => host.test(hostname));
  } catch {
    // Relative paths are local images
    return src.startsWith("/");
  }
}

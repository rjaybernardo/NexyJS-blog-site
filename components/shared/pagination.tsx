import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  // Current search params, so filters survive paging
  params?: Record<string, string | undefined>;
};

// Links rather than buttons: each page has its own URL and works without JS
const Pagination = ({ page, totalPages, params = {} }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value && key !== "page") search.set(key, value);
    }

    if (target > 1) search.set("page", String(target));

    const query = search.toString();
    return query ? `?${query}` : "?";
  };

  const linkClass = (disabled: boolean) =>
    cn(
      buttonVariants({ variant: "outline" }),
      "gap-1",
      disabled && "pointer-events-none opacity-50",
    );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <Link
        href={href(page - 1)}
        className={linkClass(page <= 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
      >
        <ChevronLeftIcon className="size-4" /> Previous
      </Link>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Link
        href={href(page + 1)}
        className={linkClass(page >= totalPages)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
      >
        Next <ChevronRightIcon className="size-4" />
      </Link>
    </nav>
  );
};

export default Pagination;

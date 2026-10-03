import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Logo = ({ href = "/", className }: { href?: string; className?: string }) => (
  <Link
    href={href}
    className={cn("flex items-center gap-2 font-serif text-xl font-medium tracking-tight", className)}
  >
    <span
      aria-hidden="true"
      className="flex size-7 items-center justify-center rounded-md bg-primary font-sans text-sm font-semibold text-primary-foreground"
    >
      {APP_NAME.replace(/^the\s+/i, "").charAt(0)}
    </span>
    {APP_NAME}
  </Link>
);

export default Logo;

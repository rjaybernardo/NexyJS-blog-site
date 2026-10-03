"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Topics" },
  { href: "/about", label: "About" },
];

const NavLinks = ({ className, linkClassName }: { className?: string; linkClassName?: string }) => {
  const pathname = usePathname();

  return (
    <div className={className}>
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground",
              linkClassName,
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NavLinks;

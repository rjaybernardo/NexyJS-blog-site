"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageSquareIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { title: "Overview", href: "/admin", icon: LayoutDashboardIcon },
  { title: "Posts", href: "/admin/posts", icon: FileTextIcon },
  { title: "Tags", href: "/admin/tags", icon: TagIcon },
  { title: "Comments", href: "/admin/comments", icon: MessageSquareIcon },
  { title: "Users", href: "/admin/users", icon: UsersIcon },
  { title: "Subscribers", href: "/admin/subscribers", icon: MailIcon },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-2"
    >
      {links.map(({ title, href, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {title}
          </Link>
        );
      })}
    </nav>
  );
}

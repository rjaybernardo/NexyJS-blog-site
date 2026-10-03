import Link from "next/link";
import { MenuIcon } from "lucide-react";

import Logo from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import ModeToggle from "./mode-toggle";
import SearchBox from "./search-box";
import UserButton from "./user-button";

const links = [
  { href: "/blog", label: "Blog" },
  { href: "/tags", label: "Topics" },
  { href: "/about", label: "About" },
];

const Header = () => (
  <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="wrapper flex h-16 items-center gap-6 py-0!">
      <Logo />

      <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <SearchBox />
        </div>
        <ModeToggle />
        <div className="hidden md:block">
          <UserButton />
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden" })}
                aria-label="Open menu"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4">
              <SearchBox />
              <nav aria-label="Mobile" className="flex flex-col gap-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-base">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <UserButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
);

export default Header;

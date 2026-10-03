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
import NavLinks from "./nav-links";
import SearchBox from "./search-box";
import UserButton from "./user-button";

const Header = () => (
  <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="wrapper flex h-16 items-center gap-6 py-0!">
      <Logo />

      <nav aria-label="Main" className="hidden md:block">
        <NavLinks className="flex items-center gap-5" linkClassName="text-sm" />
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
              <nav aria-label="Mobile">
                <NavLinks className="flex flex-col gap-3" linkClassName="text-base" />
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

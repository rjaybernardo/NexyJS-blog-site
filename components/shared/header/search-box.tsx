import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

// Plain GET form: works without JavaScript and lands on /blog?q=...
const SearchBox = ({ defaultValue }: { defaultValue?: string }) => (
  <form action="/blog" role="search" className="relative">
    <SearchIcon
      aria-hidden="true"
      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder="Search posts"
      aria-label="Search posts"
      className="w-full pl-8 sm:w-56"
    />
  </form>
);

export default SearchBox;

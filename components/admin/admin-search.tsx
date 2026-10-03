import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

// GET form that keeps the current page's other filters as hidden fields
const AdminSearch = ({
  placeholder,
  defaultValue,
  keep = {},
}: {
  placeholder: string;
  defaultValue?: string;
  keep?: Record<string, string | undefined>;
}) => (
  <form role="search" className="relative">
    {Object.entries(keep).map(([key, value]) =>
      value ? <input key={key} type="hidden" name={key} value={value} /> : null,
    )}
    <SearchIcon
      aria-hidden="true"
      className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      type="search"
      name="q"
      defaultValue={defaultValue}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-64 bg-background pl-8"
    />
  </form>
);

export default AdminSearch;

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

const TagList = ({ tags }: { tags: { name: string; slug: string }[] }) =>
  tags.length > 0 ? (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Badge variant="secondary" render={<Link href={`/blog?tag=${tag.slug}`} />}>
            {tag.name}
          </Badge>
        </li>
      ))}
    </ul>
  ) : null;

export default TagList;

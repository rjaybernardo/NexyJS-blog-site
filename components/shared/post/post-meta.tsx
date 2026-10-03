import { formatDate, readingTime } from "@/lib/utils";

type PostMetaProps = {
  author: string;
  publishedAt: Date | null;
  content: string;
};

const PostMeta = ({ author, publishedAt, content }: PostMetaProps) => (
  <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
    <span>{author}</span>
    {publishedAt && (
      <>
        <span aria-hidden="true">·</span>
        <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
      </>
    )}
    <span aria-hidden="true">·</span>
    <span>{readingTime(content)} min read</span>
  </p>
);

export default PostMeta;

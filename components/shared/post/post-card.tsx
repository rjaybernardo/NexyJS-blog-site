import Image from "next/image";
import Link from "next/link";

import PostMeta from "@/components/shared/post/post-meta";
import TagList from "@/components/shared/post/tag-list";
import type { PostCardData } from "@/lib/queries/posts";
import { canOptimizeImage, cn } from "@/lib/utils";

const PostCard = ({
  post,
  featured = false,
}: {
  post: PostCardData;
  featured?: boolean;
}) => (
  <article
    className={cn(
      "group flex flex-col gap-4",
      featured && "md:grid md:grid-cols-2 md:items-center md:gap-10",
    )}
  >
    <Link
      href={`/blog/${post.slug}`}
      className="relative block aspect-[16/10] overflow-hidden rounded-xl border bg-muted"
      tabIndex={-1}
      aria-hidden="true"
    >
      {post.coverImage ? (
        <Image
          src={post.coverImage}
          alt=""
          fill
          sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          priority={featured}
          unoptimized={!canOptimizeImage(post.coverImage)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted p-6">
          <span className="line-clamp-3 text-center font-serif text-2xl text-muted-foreground">
            {post.title}
          </span>
        </div>
      )}
    </Link>

    <div className="flex flex-col gap-3">
      <TagList tags={post.tags.slice(0, 3)} />
      <h2
        className={cn(
          "font-serif tracking-tight text-balance",
          featured ? "text-3xl md:text-4xl" : "text-2xl",
        )}
      >
        <Link href={`/blog/${post.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
          {post.title}
        </Link>
      </h2>
      <p className={cn("text-muted-foreground", featured ? "line-clamp-4 text-lg" : "line-clamp-3")}>
        {post.excerpt}
      </p>
      <PostMeta
        author={post.author.name}
        publishedAt={post.publishedAt}
        content={post.content}
      />
    </div>
  </article>
);

export default PostCard;

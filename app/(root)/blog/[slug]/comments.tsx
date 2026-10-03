import Link from "next/link";

import { auth } from "@/auth";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { deleteComment } from "@/lib/actions/comment.actions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

import CommentForm from "./comment-form";

export default async function Comments({ postId, slug }: { postId: string; slug: string }) {
  const [session, comments] = await Promise.all([
    auth(),
    prisma.comment.findMany({
      where: { postId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const user = session?.user;

  return (
    <section aria-labelledby="comments-title" className="space-y-8">
      <h2 id="comments-title" className="font-serif text-2xl tracking-tight">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      {user ? (
        <CommentForm postId={postId} />
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent(`/blog/${slug}#comments-title`)}`}
            className={buttonVariants({ variant: "outline", size: "sm", className: "mr-2" })}
          >
            Sign in
          </Link>
          to join the conversation.
        </div>
      )}

      <ol className="space-y-6">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3">
            <Avatar>
              {comment.user.image && <AvatarImage src={comment.user.image} alt="" />}
              <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{comment.user.name}</span>
                <time dateTime={comment.createdAt.toISOString()} className="text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </time>
                {(user?.id === comment.userId || user?.role === "admin") && (
                  <span className="ml-auto">
                    <DeleteDialog id={comment.id} label="comment" action={deleteComment} iconOnly />
                  </span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line break-words leading-7">{comment.content}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

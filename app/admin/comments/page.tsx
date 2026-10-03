import type { Metadata } from "next";
import Link from "next/link";

import PageHeader from "@/components/admin/page-header";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteComment } from "@/lib/actions/comment.actions";
import { getAdminComments } from "@/lib/queries/admin";
import { formatDate, parsePage } from "@/lib/utils";

export const metadata: Metadata = { title: "Comments" };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const { comments, totalPages } = await getAdminComments({ page });

  return (
    <>
      <PageHeader title="Comments" description="Remove spam or anything that breaks the rules." />

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Comment</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden lg:table-cell">Post</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No comments yet.
                </TableCell>
              </TableRow>
            )}
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="max-w-md whitespace-normal pl-4">
                  <p className="line-clamp-3">{comment.content}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p>{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">{comment.user.email}</p>
                </TableCell>
                <TableCell className="hidden max-w-48 lg:table-cell">
                  <Link href={`/blog/${comment.post.slug}`} className="block truncate hover:underline">
                    {comment.post.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(comment.createdAt)}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <DeleteDialog id={comment.id} label="comment" action={deleteComment} iconOnly />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} />
    </>
  );
}

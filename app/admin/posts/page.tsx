import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, StarIcon } from "lucide-react";

import AdminSearch from "@/components/admin/admin-search";
import PageHeader from "@/components/admin/page-header";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deletePost } from "@/lib/actions/post.actions";
import { getAdminPosts } from "@/lib/queries/admin";
import { cn, formatDate, formatNumber, parsePage } from "@/lib/utils";

import StatusToggle from "./status-toggle";

export const metadata: Metadata = { title: "Posts" };

const filters = [
  { label: "All", value: undefined },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
] as const;

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const status = params.status === "draft" || params.status === "published" ? params.status : undefined;
  const page = parsePage(params.page);

  const { posts, totalPages } = await getAdminPosts({ query, status, page });

  return (
    <>
      <PageHeader title="Posts" description="Write, edit and publish posts.">
        <AdminSearch placeholder="Search titles" defaultValue={query} keep={{ status }} />
        <Link href="/admin/posts/new" className={buttonVariants()}>
          <PlusIcon /> New post
        </Link>
      </PageHeader>

      <nav aria-label="Filter posts" className="flex gap-1">
        {filters.map((filter) => {
          const search = new URLSearchParams();
          if (filter.value) search.set("status", filter.value);
          if (query) search.set("q", query);

          return (
            <Link
              key={filter.label}
              href={`/admin/posts${search.size ? `?${search}` : ""}`}
              aria-current={status === filter.value ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: status === filter.value ? "secondary" : "ghost", size: "sm" }),
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Views</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Comments</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="max-w-xs pl-4">
                  <Link href={`/admin/posts/${post.id}`} className="flex items-center gap-1.5 font-medium hover:underline">
                    {post.featured && <StarIcon className="size-3.5 shrink-0 fill-current" aria-label="Featured" />}
                    <span className="truncate">{post.title}</span>
                  </Link>
                  <span className="block truncate text-xs text-muted-foreground">/blog/{post.slug}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{post.author.name}</TableCell>
                <TableCell className="hidden text-right tabular-nums lg:table-cell">{formatNumber(post.views)}</TableCell>
                <TableCell className="hidden text-right tabular-nums lg:table-cell">{post._count.comments}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(post.updatedAt)}</TableCell>
                <TableCell className="pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <StatusToggle id={post.id} status={post.status} />
                    <Link href={`/admin/posts/${post.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                      Edit
                    </Link>
                    <DeleteDialog id={post.id} label="post" action={deletePost} iconOnly />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} params={{ q: query, status }} />
    </>
  );
}

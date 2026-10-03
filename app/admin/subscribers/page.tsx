import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";

import PageHeader from "@/components/admin/page-header";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteSubscriber } from "@/lib/actions/subscriber.actions";
import { getSubscribers } from "@/lib/queries/admin";
import { formatDate, formatNumber, parsePage } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscribers" };

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = parsePage((await searchParams).page);
  const { subscribers, totalPages, count } = await getSubscribers({ page });

  return (
    <>
      <PageHeader
        title="Subscribers"
        description={`${formatNumber(count)} people get new posts by email.`}
      >
        {/* A plain link: route handlers download, they don't navigate */}
        <a href="/admin/subscribers/export" className={buttonVariants({ variant: "outline" })}>
          <DownloadIcon /> Export CSV
        </a>
      </PageHeader>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Email</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  No subscribers yet.
                </TableCell>
              </TableRow>
            )}
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="pl-4">{subscriber.email}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(subscriber.createdAt)}</TableCell>
                <TableCell className="pr-4 text-right">
                  <DeleteDialog id={subscriber.id} label="subscriber" action={deleteSubscriber} iconOnly />
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

import type { Metadata } from "next";

import AdminSearch from "@/components/admin/admin-search";
import PageHeader from "@/components/admin/page-header";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteUser } from "@/lib/actions/user.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminUsers } from "@/lib/queries/admin";
import { formatDate, parsePage } from "@/lib/utils";

import RoleSelect from "./role-select";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const page = parsePage(params.page);

  const { users, totalPages } = await getAdminUsers({ query, page });

  return (
    <>
      <PageHeader title="Users" description="Admins can write posts and use this dashboard.">
        <AdminSearch placeholder="Search name or email" defaultValue={query} />
      </PageHeader>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden text-right md:table-cell">Posts</TableHead>
              <TableHead className="hidden text-right md:table-cell">Comments</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => {
              const isSelf = user.id === session.user.id;

              return (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <p className="font-medium">
                      {user.name} {isSelf && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <span className="text-sm">{user.role}</span>
                    ) : (
                      <RoleSelect id={user.id} role={user.role} />
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">{user._count.posts}</TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">{user._count.comments}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    {!isSelf && <DeleteDialog id={user.id} label="user" action={deleteUser} iconOnly />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} totalPages={totalPages} params={{ q: query }} />
    </>
  );
}

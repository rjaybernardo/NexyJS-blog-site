"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateUserRole } from "@/lib/actions/user.actions";

export default function RoleSelect({ id, role }: { id: string; role: "user" | "admin" }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Role"
      defaultValue={role}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as "user" | "admin";
        const select = event.target;

        startTransition(async () => {
          const result = await updateUserRole({ id, role: next });

          if (result.success) {
            toast.success(result.message);
          } else {
            toast.error(result.message);
            select.value = role;
          }
        });
      }}
      className="h-8 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
    >
      <option value="user">user</option>
      <option value="admin">admin</option>
    </select>
  );
}

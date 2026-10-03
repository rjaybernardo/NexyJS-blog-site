"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setPostStatus } from "@/lib/actions/post.actions";

export default function StatusToggle({ id, status }: { id: string; status: "draft" | "published" }) {
  const [pending, startTransition] = useTransition();
  const next = status === "published" ? "draft" : "published";

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setPostStatus(id, next);
          if (result.success) toast.success(result.message);
          else toast.error(result.message);
        })
      }
    >
      {status === "published" ? "Unpublish" : "Publish"}
    </Button>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTag } from "@/lib/actions/tag.actions";

export default function TagForm() {
  const [state, action, pending] = useActionState(createTag, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;

    if (state.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex max-w-md gap-2">
      <Input name="name" required minLength={2} maxLength={32} placeholder="New tag name" aria-label="Tag name" />
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add tag"}
      </Button>
    </form>
  );
}

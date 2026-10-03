"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { unsubscribe } from "@/lib/actions/subscriber.actions";

export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(unsubscribe, null);

  if (state?.success) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">{state.message} You won&apos;t get any more emails from us.</p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to the blog
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <p className="text-muted-foreground">Stop getting an email when a new post is published?</p>
      {state && !state.success && <p className="text-sm">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Unsubscribing..." : "Unsubscribe"}
      </Button>
    </form>
  );
}

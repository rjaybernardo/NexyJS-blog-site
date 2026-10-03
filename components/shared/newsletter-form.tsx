"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe } from "@/lib/actions/subscriber.actions";

const NewsletterForm = () => {
  const [state, action, pending] = useActionState(subscribe, null);
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
    <form ref={formRef} action={action} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        autoComplete="email"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Joining..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterForm;

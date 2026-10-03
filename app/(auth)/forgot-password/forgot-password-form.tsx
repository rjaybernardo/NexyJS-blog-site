"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/actions/user.actions";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground" role="status">{state.message}</p>
        <Link href="/sign-in" className="text-sm font-medium underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        {state && !state.success && <FieldError>{state.message}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending..." : "Send reset link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

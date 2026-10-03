"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/actions/user.actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        </Field>
        {state && !state.success && (
          <FieldError>
            {state.message}{" "}
            {state.message.includes("expired") && (
              <Link href="/forgot-password" className="underline underline-offset-4">
                Request a new link
              </Link>
            )}
          </FieldError>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : "Save new password"}
        </Button>
      </FieldGroup>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInWithCredentials } from "@/lib/actions/user.actions";

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(signInWithCredentials, null);

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </Field>
        {state && !state.success && <FieldError>{state.message}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}

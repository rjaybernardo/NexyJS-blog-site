"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/lib/actions/user.actions";

export default function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action, pending] = useActionState(changePassword, null);
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
    <form ref={formRef} action={action}>
      <FieldGroup>
        {hasPassword && (
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input id="newPassword" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmNewPassword">Confirm new password</FieldLabel>
          <Input id="confirmNewPassword" name="confirmPassword" type="password" required autoComplete="new-password" />
        </Field>
        <div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Saving..." : hasPassword ? "Change password" : "Set password"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

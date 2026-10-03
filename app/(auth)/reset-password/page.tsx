import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-serif text-2xl font-normal">Choose a new password</CardTitle>
        <CardDescription>At least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            This link is missing its token.{" "}
            <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-4">
              Request a new link
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

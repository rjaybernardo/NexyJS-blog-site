import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AuthCard from "@/components/shared/auth-card";
import { getSafeCallbackUrl } from "@/lib/utils";

import SignInForm from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <AuthCard title="Welcome back" description="Sign in to your account" callbackUrl={callbackUrl}>
      {params.reset && (
        <p role="status" className="rounded-md bg-muted px-3 py-2 text-center text-sm">
          Password updated. Sign in with your new password.
        </p>
      )}
      {/* Auth.js sends OAuth failures back here, e.g. ?error=OAuthAccountNotLinked */}
      {params.error && (
        <p role="alert" className="rounded-md bg-muted px-3 py-2 text-center text-sm">
          That sign-in didn&apos;t work. Try again, or use your email and password.
        </p>
      )}
      <SignInForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}

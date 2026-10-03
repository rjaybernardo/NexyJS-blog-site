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
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = getSafeCallbackUrl((await searchParams).callbackUrl);

  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <AuthCard title="Welcome back" description="Sign in to your account" callbackUrl={callbackUrl}>
      <SignInForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}

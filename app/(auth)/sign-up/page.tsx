import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import AuthCard from "@/components/shared/auth-card";
import { getSafeCallbackUrl } from "@/lib/utils";

import SignUpForm from "./sign-up-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = getSafeCallbackUrl((await searchParams).callbackUrl);

  if ((await auth())?.user) redirect(callbackUrl);

  return (
    <AuthCard title="Create an account" description="Join to comment on posts" callbackUrl={callbackUrl}>
      <SignUpForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}

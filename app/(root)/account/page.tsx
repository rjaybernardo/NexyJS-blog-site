import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true },
  });

  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-lg space-y-8 py-10 md:py-16">
      <div className="space-y-1">
        <h1 className="font-serif text-4xl tracking-tight">Account</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>
      <ProfileForm name={user.name} bio={user.bio ?? ""} />
    </div>
  );
}

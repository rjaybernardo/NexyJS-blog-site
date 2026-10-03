import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";

import PasswordForm from "./password-form";
import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/account");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true, password: true },
  });

  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-lg space-y-10 py-10 md:py-16">
      <div className="space-y-1">
        <h1 className="font-serif text-4xl tracking-tight">Account</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <section aria-labelledby="profile-title" className="space-y-4">
        <h2 id="profile-title" className="font-medium">Profile</h2>
        <ProfileForm name={user.name} bio={user.bio ?? ""} />
      </section>

      <Separator />

      <section aria-labelledby="password-title" className="space-y-4">
        <div className="space-y-1">
          <h2 id="password-title" className="font-medium">Password</h2>
          {!user.password && (
            <p className="text-sm text-muted-foreground">
              You signed up with Google. Set a password to also sign in with your email.
            </p>
          )}
        </div>
        <PasswordForm hasPassword={Boolean(user.password)} />
      </section>
    </div>
  );
}

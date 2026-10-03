"use server";

import { hash } from "bcrypt-ts-edge";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth, signIn, signOut, unstable_update } from "@/auth";
import { assertAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getSafeCallbackUrl } from "@/lib/utils";
import { formatError } from "@/lib/utils/server";
import {
  profileSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserRoleSchema,
} from "@/lib/validators";

export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // Password is verified once, in the Credentials provider's authorize()
    await signIn("credentials", { ...user, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.type === "CredentialsSignin"
            ? "Invalid email or password"
            : "Something went wrong",
      };
    }

    return { success: false, message: formatError(error) };
  }

  redirect(getSafeCallbackUrl(formData.get("callbackUrl")));
}

export async function signUp(_prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await hash(user.password, 10),
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: user.password,
      redirect: false,
    });
  } catch (error) {
    return { success: false, message: formatError(error) };
  }

  redirect(getSafeCallbackUrl(formData.get("callbackUrl")));
}

export async function signInWithGoogle(formData: FormData) {
  await signIn("google", {
    redirectTo: getSafeCallbackUrl(formData.get("callbackUrl")),
  });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfile(_prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Sign in first");

    const data = profileSchema.parse({
      name: formData.get("name"),
      bio: formData.get("bio") ?? "",
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, bio: data.bio || null },
    });

    // The name shown in the header comes from the session token
    await unstable_update({ user: { name: data.name } });

    revalidatePath("/", "layout");

    return { success: true, message: "Profile updated" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUserRole(data: z.infer<typeof updateUserRoleSchema>) {
  try {
    const session = await assertAdmin();
    const { id, role } = updateUserRoleSchema.parse(data);

    if (id === session.user.id) {
      throw new Error("You can't change your own role");
    }

    await prisma.user.update({ where: { id }, data: { role } });

    revalidatePath("/admin/users");

    return { success: true, message: `Role changed to ${role}` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await assertAdmin();
    z.uuid().parse(id);

    if (id === session.user.id) {
      throw new Error("You can't delete your own account here");
    }

    const posts = await prisma.post.count({ where: { authorId: id } });
    if (posts > 0) {
      throw new Error(
        `This user wrote ${posts} post(s). Delete or reassign them first.`,
      );
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin", "layout");

    return { success: true, message: "User deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

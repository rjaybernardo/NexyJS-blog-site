"use server";

import { compare, hash } from "bcrypt-ts-edge";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth, signIn, signOut, unstable_update } from "@/auth";
import PasswordReset from "@/emails/password-reset";
import { assertAdmin } from "@/lib/auth-guard";
import { APP_NAME, SERVER_URL } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { consumeTokenByValue, createToken } from "@/lib/tokens";
import { getSafeCallbackUrl } from "@/lib/utils";
import { formatError } from "@/lib/utils/server";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  profileSchema,
  resetPasswordSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserRoleSchema,
} from "@/lib/validators";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await assertRateLimit({ key: `signin-ip:${await getClientIp()}`, limit: 20, windowMs: 15 * MINUTE });
    await assertRateLimit({ key: `signin-email:${user.email}`, limit: 5, windowMs: 15 * MINUTE });

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

    await assertRateLimit({ key: `signup:${await getClientIp()}`, limit: 5, windowMs: HOUR });

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

// Same reply whether or not the email has an account, so the form can't be
// used to find out who is registered
export async function requestPasswordReset(_prevState: unknown, formData: FormData) {
  try {
    const { email } = forgotPasswordSchema.parse({ email: formData.get("email") });

    await assertRateLimit({ key: `reset-ip:${await getClientIp()}`, limit: 10, windowMs: HOUR });
    await assertRateLimit({ key: `reset-email:${email}`, limit: 3, windowMs: HOUR });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (user) {
      const token = await createToken("reset", email, HOUR);

      await sendEmail({
        to: email,
        subject: `Reset your ${APP_NAME} password`,
        react: PasswordReset({
          appName: APP_NAME,
          siteUrl: SERVER_URL,
          resetUrl: `${SERVER_URL}/reset-password?token=${token}`,
        }),
      });
    }

    return {
      success: true,
      message: "If an account uses that email, a reset link is on its way. Check your inbox.",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function resetPassword(_prevState: unknown, formData: FormData) {
  try {
    const data = resetPasswordSchema.parse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    await assertRateLimit({ key: `reset-use:${await getClientIp()}`, limit: 10, windowMs: HOUR });

    const email = await consumeTokenByValue("reset", data.token);

    if (!email) {
      throw new Error("This reset link is invalid or has expired. Request a new one.");
    }

    await prisma.user.update({
      where: { email },
      data: { password: await hash(data.password, 10) },
    });
  } catch (error) {
    return { success: false, message: formatError(error) };
  }

  redirect("/sign-in?reset=1");
}

export async function changePassword(_prevState: unknown, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Sign in first");

    const data = changePasswordSchema.parse({
      currentPassword: formData.get("currentPassword") ?? "",
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    await assertRateLimit({ key: `change-password:${session.user.id}`, limit: 5, windowMs: 15 * MINUTE });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) throw new Error("Account not found");

    // Accounts made with Google have no password yet; they can set one
    if (user.password && !(await compare(data.currentPassword, user.password))) {
      throw new Error("Current password is incorrect");
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: await hash(data.password, 10) },
    });

    return { success: true, message: "Password updated" };
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

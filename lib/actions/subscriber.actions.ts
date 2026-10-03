"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import WelcomeSubscriber from "@/emails/welcome-subscriber";
import { assertAdmin } from "@/lib/auth-guard";
import { APP_NAME, SERVER_URL } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { unsubscribeHeaders, unsubscribeUrl } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { assertRateLimit, getClientIp } from "@/lib/rate-limit";
import { formatError } from "@/lib/utils/server";
import { subscribeSchema } from "@/lib/validators";

const HOUR = 60 * 60 * 1000;

export async function subscribe(_prevState: unknown, formData: FormData) {
  try {
    const { email } = subscribeSchema.parse({ email: formData.get("email") });

    await assertRateLimit({ key: `subscribe:${await getClientIp()}`, limit: 5, windowMs: HOUR });

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    // Same answer either way, so the form can't reveal who subscribed
    if (!existing) {
      const subscriber = await prisma.subscriber.create({ data: { email } });

      await sendEmail({
        to: email,
        subject: `You're subscribed to ${APP_NAME}`,
        headers: unsubscribeHeaders(subscriber.token),
        react: WelcomeSubscriber({
          appName: APP_NAME,
          siteUrl: SERVER_URL,
          unsubscribeUrl: unsubscribeUrl(subscriber.token),
        }),
      });

      revalidatePath("/admin", "layout");
    }

    return { success: true, message: "Thanks! You're on the list." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function unsubscribe(_prevState: unknown, formData: FormData) {
  try {
    const token = z.string().min(16).max(64).parse(formData.get("token"));

    // deleteMany: an unknown or already-used token is not an error
    await prisma.subscriber.deleteMany({ where: { token } });
    revalidatePath("/admin", "layout");

    return { success: true, message: "You've been unsubscribed." };
  } catch {
    return { success: false, message: "That unsubscribe link isn't valid." };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await assertAdmin();
    await prisma.subscriber.delete({ where: { id: z.uuid().parse(id) } });

    revalidatePath("/admin", "layout");

    return { success: true, message: "Subscriber removed" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import WelcomeSubscriber from "@/emails/welcome-subscriber";
import { assertAdmin } from "@/lib/auth-guard";
import { APP_NAME, SERVER_URL } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { formatError } from "@/lib/utils/server";
import { subscribeSchema } from "@/lib/validators";

export async function subscribe(_prevState: unknown, formData: FormData) {
  try {
    const { email } = subscribeSchema.parse({ email: formData.get("email") });

    const existing = await prisma.subscriber.findUnique({ where: { email } });

    // Same answer either way, so the form can't reveal who subscribed
    if (!existing) {
      await prisma.subscriber.create({ data: { email } });
      await sendEmail({
        to: email,
        subject: `You're subscribed to ${APP_NAME}`,
        react: WelcomeSubscriber({ appName: APP_NAME, siteUrl: SERVER_URL }),
      });
      revalidatePath("/admin", "layout");
    }

    return { success: true, message: "Thanks! You're on the list." };
  } catch (error) {
    return { success: false, message: formatError(error) };
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

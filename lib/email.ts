import "server-only";

import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

import { APP_NAME } from "@/lib/constants";

type Email = {
  to: string;
  subject: string;
  react: ReactElement;
};

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const from = process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`;

// Sends through Resend, or logs the email when no API key is set. Never
// throws: a failed email shouldn't fail the action that triggered it.
export async function sendEmail({ to, subject, react }: Email) {
  if (!resend) {
    console.info(
      `[email] RESEND_API_KEY not set; would send "${subject}" to ${to}\n` +
        (await render(react, { plainText: true })),
    );
    return;
  }

  const { error } = await resend.emails.send({ from, to, subject, react });

  if (error) {
    console.error("Could not send email", error);
  }
}

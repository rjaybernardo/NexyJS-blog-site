import "server-only";

import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { Resend } from "resend";

import { APP_NAME } from "@/lib/constants";

export type Email = {
  to: string;
  subject: string;
  react: ReactElement;
  headers?: Record<string, string>;
};

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// Resend's test sender only delivers to the Resend account's own address;
// set EMAIL_FROM to an address on a verified domain to email anyone
const from = process.env.EMAIL_FROM || `${APP_NAME} <onboarding@resend.dev>`;

export const isEmailConfigured = resend !== null;

const logEmail = async ({ to, subject, react }: Email) =>
  console.info(
    `[email] RESEND_API_KEY not set; would send "${subject}" to ${to}\n` +
      (await render(react, { plainText: true })),
  );

// Sends through Resend, or logs the email when no API key is set. Never
// throws: a failed email shouldn't fail the action that triggered it.
export async function sendEmail(email: Email) {
  if (!resend) return logEmail(email);

  try {
    const { error } = await resend.emails.send({ from, ...email });
    if (error) console.error("Could not send email", error);
  } catch (error) {
    console.error("Could not send email", error);
  }
}

// Resend's batch endpoint takes up to 100 emails per request
const BATCH_SIZE = 100;

export async function sendEmails(emails: Email[]) {
  if (!resend) {
    for (const email of emails) await logEmail(email);
    return;
  }

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE).map((email) => ({ from, ...email }));

    try {
      const { error } = await resend.batch.send(batch);
      if (error) console.error("Could not send email batch", error);
    } catch (error) {
      console.error("Could not send email batch", error);
    }
  }
}

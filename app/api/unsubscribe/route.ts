import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

/*
 * RFC 8058 one-click unsubscribe: mail apps POST here from their own
 * "Unsubscribe" button (see List-Unsubscribe-Post in lib/newsletter.ts).
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token || token.length < 16 || token.length > 64) {
    return new Response("Invalid token", { status: 400 });
  }

  await prisma.subscriber.deleteMany({ where: { token } });
  revalidatePath("/admin", "layout");

  return new Response("Unsubscribed", { status: 200 });
}

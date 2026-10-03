import { isAdmin } from "@/lib/auth-guard";
import { toCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = await prisma.subscriber.findMany({
    select: { email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const csv = toCsv([
    ["email", "subscribed_at"],
    ...subscribers.map((s) => [s.email, s.createdAt]),
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  slug: z.string().min(1).max(80),
  visitorId: z.string().min(8).max(80),
  kind: z.enum(["view", "heartbeat", "leave"]).optional().default("view"),
});

/**
 * Records public menu analytics: `view` inserts a visit row + presence;
 * `heartbeat` refreshes presence only; `leave` removes presence.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { slug, visitorId, kind } = parsed.data;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const restaurantId = restaurant.id;
  const now = new Date();

  if (kind === "leave") {
    await prisma.analyticsPresence.deleteMany({
      where: { restaurantId, visitorId },
    });
    return NextResponse.json({ ok: true });
  }

  if (kind === "view") {
    await prisma.$transaction([
      prisma.analyticsVisit.create({
        data: { restaurantId, visitorId },
      }),
      prisma.analyticsPresence.upsert({
        where: {
          restaurantId_visitorId: { restaurantId, visitorId },
        },
        create: { restaurantId, visitorId, lastSeenAt: now },
        update: { lastSeenAt: now },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // heartbeat
  await prisma.analyticsPresence.upsert({
    where: {
      restaurantId_visitorId: { restaurantId, visitorId },
    },
    create: { restaurantId, visitorId, lastSeenAt: now },
    update: { lastSeenAt: now },
  });

  return NextResponse.json({ ok: true });
}

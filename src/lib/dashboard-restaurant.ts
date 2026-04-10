import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getDashboardRestaurantSummary() {
  const session = await auth();
  if (!session?.user?.id) return { session: null, restaurant: null };

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      instagramUrl: true,
      tiktokUrl: true,
      _count: { select: { menuItems: true } },
    },
  });

  return { session, restaurant };
}

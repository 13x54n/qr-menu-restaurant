import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MenuManager } from "@/components/dashboard/menu-manager";

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
    include: {
      menuItems: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] },
    },
  });

  if (!restaurant) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
          Menu
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Search, edit, or remove items. Use Add item for new dishes (including option groups).
        </p>
      </div>

      <MenuManager items={restaurant.menuItems} />
    </div>
  );
}

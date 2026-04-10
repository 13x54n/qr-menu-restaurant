import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RestaurantBrandingForm } from "@/components/restaurant-branding-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });

  if (!restaurant) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Branding and links shown on your public menu header.
        </p>
      </div>

      <RestaurantBrandingForm
        initialLogoUrl={restaurant.logoUrl}
        initialInstagramUrl={restaurant.instagramUrl}
        initialTiktokUrl={restaurant.tiktokUrl}
      />
    </div>
  );
}

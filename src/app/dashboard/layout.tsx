import { redirect } from "next/navigation";
import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { getDashboardRestaurantSummary } from "@/lib/dashboard-restaurant";
import { menuPublicUrl } from "@/lib/public-url";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, restaurant } = await getDashboardRestaurantSummary();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-20 text-center text-muted-foreground">
        <p>No restaurant linked to this account.</p>
      </div>
    );
  }

  return (
    <div className="dark flex min-h-full flex-1 flex-col bg-background font-sans antialiased">
      <DashboardFrame
        restaurant={{
          name: restaurant.name,
          slug: restaurant.slug,
          itemCount: restaurant._count.menuItems,
          logoUrl: restaurant.logoUrl,
        }}
        user={{
          name: session.user.name ?? "Owner",
          email: session.user.email ?? "",
          image: session.user.image,
        }}
        publicMenuUrl={menuPublicUrl(restaurant.slug)}
      >
        {children}
      </DashboardFrame>
    </div>
  );
}

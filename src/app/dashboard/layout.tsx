import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardRestaurantSummary } from "@/lib/dashboard-restaurant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, restaurant } = await getDashboardRestaurantSummary();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#0c0a09] px-4 py-20 text-center text-stone-400">
        <p>No restaurant linked to this account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-[#0c0a09] text-stone-100 antialiased">
      <DashboardShell
        restaurant={{
          name: restaurant.name,
          slug: restaurant.slug,
          itemCount: restaurant._count.menuItems,
        }}
      >
        {children}
      </DashboardShell>
    </div>
  );
}

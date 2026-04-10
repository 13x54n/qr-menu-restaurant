"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardSiteHeader } from "@/components/dashboard/dashboard-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Restaurant = {
  name: string;
  slug: string;
  itemCount: number;
  logoUrl: string | null;
};

type User = {
  name: string;
  email: string;
  image?: string | null;
};

type Props = {
  restaurant: Restaurant;
  user: User;
  publicMenuUrl: string;
  children: React.ReactNode;
};

export function DashboardFrame({ restaurant, user, publicMenuUrl, children }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar restaurant={restaurant} user={user} publicMenuUrl={publicMenuUrl} variant="inset" />
      <SidebarInset>
        <DashboardSiteHeader />
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

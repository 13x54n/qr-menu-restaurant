"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { DashboardNavUser } from "@/components/dashboard/dashboard-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ExternalLink, LayoutDashboard, UserRound, UtensilsCrossed } from "lucide-react";

type Restaurant = {
  name: string;
  slug: string;
  itemCount: number;
  logoUrl: string | null;
};

function firstWord(name: string): string {
  const w = name.trim().split(/\s+/)[0];
  return w && w.length > 0 ? w.slice(0, 16) : "?";
}

function BrandMark({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className="size-8 shrink-0 rounded-md object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md text-center text-sm font-semibold leading-none text-sidebar-foreground">
      {firstWord(name)}
    </span>
  );
}

type User = {
  name: string;
  email: string;
  image?: string | null;
};

type Props = React.ComponentProps<typeof Sidebar> & {
  restaurant: Restaurant;
  user: User;
  publicMenuUrl: string;
};

const nav = [
  { title: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { title: "Profile", href: "/dashboard/profile", icon: UserRound },
  { title: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
] as const;

export function AppSidebar({ restaurant, user, publicMenuUrl, ...props }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5! bg-transparent shadow-none hover:!bg-transparent active:!bg-transparent data-[active]:!bg-transparent dark:data-[active]:!bg-transparent"
              isActive={pathname === "/dashboard/overview"}
              render={<Link href="/dashboard/overview" />}
            >
              <BrandMark name={restaurant.name} logoUrl={restaurant.logoUrl} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{restaurant.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {restaurant.itemCount} menu items
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    tooltip={title}
                    render={<Link href={href} />}
                  >
                    <Icon />
                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href={publicMenuUrl} target="_blank" rel="noopener noreferrer" />}>
                  <ExternalLink />
                  <span>View live menu</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

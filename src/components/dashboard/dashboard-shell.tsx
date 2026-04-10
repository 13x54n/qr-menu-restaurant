"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/actions/auth";

const nav = [
  { href: "/dashboard/overview", label: "Overview", icon: OverviewIcon },
  { href: "/dashboard/profile", label: "Profile", icon: ProfileIcon },
  { href: "/dashboard/menu", label: "Menu", icon: MenuIcon },
] as const;

function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 8.25a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18V8.25zM3.75 16.5a2.25 2.25 0 012.25-2.25H9a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 019 20.25H6a2.25 2.25 0 01-2.25-2.25v-1.5z" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function MenuOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

type Props = {
  restaurant: { name: string; slug: string; itemCount: number };
  children: React.ReactNode;
};

export function DashboardShell({ restaurant, children }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard/overview" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                : "text-stone-400 hover:bg-stone-800/80 hover:text-stone-200"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-stone-800 bg-stone-950/80 lg:flex">
        <div className="border-b border-stone-800 px-4 py-4">
          <p className="truncate font-serif text-lg font-semibold text-stone-100">{restaurant.name}</p>
          <p className="mt-0.5 text-xs text-stone-500">{restaurant.itemCount} menu items</p>
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-stone-800 p-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      <button
        type="button"
        aria-hidden={!drawerOpen}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col border-r border-stone-800 bg-[#0c0a09] shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-serif font-semibold text-stone-100">{restaurant.name}</p>
            <p className="text-xs text-stone-500">{restaurant.itemCount} items</p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
            aria-label="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <NavLinks onNavigate={() => setDrawerOpen(false)} />
        <div className="mt-auto border-t border-stone-800 p-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-stone-700 px-3 py-2 text-sm text-stone-300 hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-800 bg-[#0c0a09]/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-stone-300 hover:bg-stone-800"
            aria-label="Open navigation"
          >
            <MenuOpenIcon className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-200">{restaurant.name}</p>
            <p className="text-xs text-stone-500">Dashboard</p>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { InstagramIcon, TikTokIcon } from "@/components/menu-public/menu-icons";
import { PublicMenuItem, type PublicMenuItemData } from "@/components/menu-public/public-menu-item";

const ALL_ID = "all";

export type PublicMenuSection = {
  id: string;
  title: string;
  items: PublicMenuItemData[];
};

export type PublicMenuRestaurant = {
  name: string;
  logoUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
};

type Props = {
  restaurant: PublicMenuRestaurant;
  sections: PublicMenuSection[];
};

export function PublicMenuShell({ restaurant, sections }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_ID);

  const sectionsToShow =
    selectedCategory === ALL_ID
      ? sections
      : sections.filter((s) => s.id === selectedCategory);

  return (
    <div className="mobile-only flex flex-col bg-[var(--menu-bg)]">
      <div className="sticky top-0 z-10 border-b border-[var(--menu-border)] bg-[var(--menu-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--menu-bg)]/80">
        <header className="flex items-center justify-between px-5 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {restaurant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- owner-supplied arbitrary URLs
              <img
                src={restaurant.logoUrl}
                alt=""
                width={140}
                height={56}
                className="h-14 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--menu-border)] font-semibold text-[var(--menu-accent)]">
                {restaurant.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-sm font-semibold text-[var(--menu-fg)]">{restaurant.name}</p>
              <p className="text-sm text-[var(--menu-muted)]">Food Menu</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            {restaurant.instagramUrl ? (
              <a
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--menu-muted)] transition-colors hover:text-[var(--menu-fg)]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            ) : null}
            {restaurant.tiktokUrl ? (
              <a
                href={restaurant.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--menu-muted)] transition-colors hover:text-[var(--menu-fg)]"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        </header>

        <nav className="px-4 pb-2" aria-label="Menu categories">
          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory(ALL_ID)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--menu-accent)] ${
                selectedCategory === ALL_ID
                  ? "bg-[var(--menu-accent)] text-[var(--menu-bg)]"
                  : "bg-[var(--menu-border)] text-[var(--menu-fg)] hover:bg-[var(--menu-accent)] hover:text-[var(--menu-bg)]"
              }`}
            >
              All
            </button>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedCategory(section.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--menu-accent)] ${
                  selectedCategory === section.id
                    ? "bg-[var(--menu-accent)] text-[var(--menu-bg)]"
                    : "bg-[var(--menu-border)] text-[var(--menu-fg)] hover:bg-[var(--menu-accent)] hover:text-[var(--menu-bg)]"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <main className="flex-1 px-5 pb-8 pt-2">
        {sections.length === 0 ? (
          <p className="py-12 text-center text-[var(--menu-muted)]">Menu coming soon.</p>
        ) : (
          sectionsToShow.map((section) => (
            <section key={section.id} className="pt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--menu-accent)]">
                {section.title}
              </h2>
              <ul className="list-none">
                {section.items.map((item) => (
                  <PublicMenuItem key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

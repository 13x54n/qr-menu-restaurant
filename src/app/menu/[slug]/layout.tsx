import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description: "Food menu",
};

export default function PublicMenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="menu-public min-h-dvh scroll-smooth text-[var(--menu-fg)]">{children}</div>
  );
}

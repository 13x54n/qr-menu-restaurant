import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/components/menu-public/analytics-beacon";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Menu",
  description: "Food menu",
};

export default async function PublicMenuLayout({ children, params }: Props) {
  const { slug } = await params;

  return (
    <div className="menu-public min-h-dvh scroll-smooth text-[var(--menu-fg)]">
      <AnalyticsBeacon slug={slug} />
      {children}
    </div>
  );
}

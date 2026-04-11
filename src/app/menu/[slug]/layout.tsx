import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/components/menu-public/analytics-beacon";
import { prisma } from "@/lib/prisma";

type Props = { children: React.ReactNode; params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, logoUrl: true },
  });

  if (!restaurant) {
    return { title: "Menu", description: "Food menu" };
  }

  const logo = restaurant.logoUrl?.trim();
  const metadata: Metadata = {
    title: restaurant.name,
    description: `Food menu — ${restaurant.name}`,
  };

  if (logo) {
    metadata.icons = { icon: logo, apple: logo };
  }

  return metadata;
}

export default async function PublicMenuLayout({ children, params }: Props) {
  const { slug } = await params;

  return (
    <div className="menu-public min-h-dvh scroll-smooth text-[var(--menu-fg)]">
      <AnalyticsBeacon slug={slug} />
      {children}
    </div>
  );
}

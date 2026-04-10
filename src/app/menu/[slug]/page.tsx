import { notFound } from "next/navigation";
import { PublicMenuShell } from "@/components/menu-public/public-menu-shell";
import type { PublicMenuItemData } from "@/components/menu-public/public-menu-item";
import { prisma } from "@/lib/prisma";
import { parseOptionGroupsJson } from "@/lib/option-groups";
import { slugifyCategory } from "@/lib/slugify";

type Props = { params: Promise<{ slug: string }> };

function uniqueSectionIds(categories: string[]): Map<string, string> {
  const used = new Set<string>();
  const map = new Map<string, string>();
  for (const title of categories) {
    let base = slugifyCategory(title);
    let key = base;
    let n = 1;
    while (used.has(key)) {
      key = `${base}-${n++}`;
    }
    used.add(key);
    map.set(title, key);
  }
  return map;
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      menuItems: { orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] },
    },
  });

  if (!restaurant) notFound();

  const byCategory = restaurant.menuItems.reduce(
    (acc, item) => {
      const c = item.category || "General";
      if (!acc[c]) acc[c] = [];
      acc[c].push(item);
      return acc;
    },
    {} as Record<string, typeof restaurant.menuItems>,
  );

  const categoryTitles = Object.keys(byCategory).sort((a, b) => a.localeCompare(b));
  const idMap = uniqueSectionIds(categoryTitles);

  const sections = categoryTitles.map((title) => ({
    id: idMap.get(title)!,
    title,
    items: byCategory[title].map((row): PublicMenuItemData => {
      const groups = parseOptionGroupsJson(row.optionGroups);
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        priceCents: row.priceCents,
        optionGroups: groups,
      };
    }),
  }));

  return (
    <PublicMenuShell
      restaurant={{
        name: restaurant.name,
        logoUrl: restaurant.logoUrl,
        instagramUrl: restaurant.instagramUrl,
        tiktokUrl: restaurant.tiktokUrl,
      }}
      sections={sections}
    />
  );
}

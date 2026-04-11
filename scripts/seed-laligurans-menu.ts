/**
 * One-off seed: Lali Gurans menu for a fixed restaurant.
 * Aloo Chop: $11.99 (shareables sticker) vs $9.99 on "new" card — using $11.99 per plan.
 * Aloo Chop + Dharane Thukpa appear on "NEW ON THE MENU" — imported once under SHAREABLES only.
 */
import { PrismaClient, Prisma } from "@prisma/client";

const RESTAURANT_ID = "cmnukbaq90001kw04xqn01cex";

type SeedItem = {
  name: string;
  description?: string | null;
  priceCents?: number | null;
  category: string;
  sortOrder: number;
  optionGroups?: Prisma.InputJsonValue;
};

const items: SeedItem[] = [
  // SHAREABLES
  {
    category: "SHAREABLES",
    sortOrder: 0,
    name: "Masala Papad",
    priceCents: 1180,
    description:
      "Crispy lentil wafer topped with mix of onions, tomatoes, green chili, cilantro, and Nepali spices.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 1,
    name: "Buff Bhutan",
    priceCents: 1699,
    description:
      "Crispy fried buff intestines, onions, green chili, seasoned with a blend of traditional Nepali spices.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 2,
    name: "Piro Alu",
    priceCents: 999,
    description: "Spicy potatoes, cumin, turmeric, green chili.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 3,
    name: "Sukuti",
    priceCents: null,
    description: "Dried meat, onions, tomatoes, green chili.",
    optionGroups: [
      {
        label: "Protein",
        choices: [
          { name: "Beef", priceCents: 1499 },
          { name: "Buff", priceCents: 1699 },
        ],
      },
    ],
  },
  {
    category: "SHAREABLES",
    sortOrder: 4,
    name: "Chatpatey",
    priceCents: 1199,
    description:
      "Tangy & spicy mix of puffed rice, potatoes, peas, mix veg, green chili, garnished with lemon and cilantro.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 5,
    name: "Mustang Alu",
    priceCents: 1299,
    description: "Potatoes wedges cooked with garlic, green onions, and Himalayan herbs.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 6,
    name: "Laphing (Dry / soup)",
    priceCents: 1399,
    description: "Spicy cold noodles.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 7,
    name: "Veg Pakora",
    priceCents: 1499,
    description: "Crispy deep-fried battered onions & mix veg.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 8,
    name: "Fish Pakora",
    priceCents: 1599,
    description: "Marinated & fried basa fish.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 9,
    name: "Chicken Lollipop",
    priceCents: 1599,
    description: "Fried chicken drumettes, crispy.",
  },
  {
    category: "SHAREABLES",
    sortOrder: 10,
    name: "Chicken Wings",
    priceCents: 1499,
    description: "Fried chicken wings (salt & pepper / spicy).",
  },
  {
    category: "SHAREABLES",
    sortOrder: 11,
    name: "Aloo Chop (5 pieces)",
    priceCents: 1199,
    description:
      "Mashed potato with green peas, onions, corrinder and Nepali spices. (Also listed on “New on the menu”; price uses shareables sticker $11.99.)",
  },
  {
    category: "SHAREABLES",
    sortOrder: 12,
    name: "Dharane Thukpa",
    priceCents: 1500,
    description:
      "Soup noodles with fried mashed potato, carrot, green pepper and black peas.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Veg" }, { name: "Chicken" }, { name: "Buff" }, { name: "Beef" }],
      },
    ],
  },

  // NEWARI DISHES
  {
    category: "NEWARI DISHES",
    sortOrder: 0,
    name: "Samay Baji",
    priceCents: 1899,
    description:
      "Choyela (marinated meat), Bhatmas (roasted soybeans), lentil patty, seasoned boiled egg, beaten rice, potato, eyed peas & bamboo shoots.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }, { name: "Chicken" }, { name: "Veg" }],
      },
    ],
  },
  {
    category: "NEWARI DISHES",
    sortOrder: 1,
    name: "Bara",
    priceCents: null,
    description:
      "Traditional lentil pancakes served with a choice of a fried egg or ground buff meat on top.",
    optionGroups: [
      {
        label: "Style",
        choices: [
          { name: "Egg", priceCents: 1499 },
          { name: "Chicken Keema", priceCents: 1699 },
        ],
      },
    ],
  },
  {
    category: "NEWARI DISHES",
    sortOrder: 2,
    name: "Choyela",
    priceCents: null,
    description:
      "Charbroiled meat, marinated in a mix of garlic, ginger, and Nepali spices, spicy & served cold.",
    optionGroups: [
      {
        label: "Protein",
        choices: [
          { name: "Chicken", priceCents: 1599 },
          { name: "Buff", priceCents: 1599 },
        ],
      },
    ],
  },

  // SANDHEKO
  {
    category: "SANDHEKO",
    sortOrder: 0,
    name: "Alu (Potato)",
    priceCents: 1399,
    description:
      "Marinated with onions, tomato, chili, cilantro, lime, house sauce & spices. (Section intro applies to Sandheko items.)",
  },
  {
    category: "SANDHEKO",
    sortOrder: 1,
    name: "Sandheko Sukuti",
    priceCents: null,
    description:
      "Dried meat (beef / buff), onions, tomato, chili, cilantro, lime, house sauce & spices. Sandheko-style; distinct from shareables Sukuti.",
    optionGroups: [
      {
        label: "Protein",
        choices: [
          { name: "Beef", priceCents: 1599 },
          { name: "Buff", priceCents: 1699 },
        ],
      },
    ],
  },
  {
    category: "SANDHEKO",
    sortOrder: 2,
    name: "Peanut",
    priceCents: 1399,
    description: "Marinated with onions, tomato, chili, cilantro, lime, house sauce & spices.",
  },
  {
    category: "SANDHEKO",
    sortOrder: 3,
    name: "Bhatmas (Roasted Soybeans)",
    priceCents: 1399,
    description: "Marinated with onions, tomato, chili, cilantro, lime, house sauce & spices.",
  },

  // CHILLI
  {
    category: "CHILLI",
    sortOrder: 0,
    name: "Fries Chilli",
    priceCents: 1499,
    description:
      "Stir fried onions, tomatoes, green pepper, chili & sauce. (Section intro applies to Chilli items.)",
  },
  {
    category: "CHILLI",
    sortOrder: 1,
    name: "Chicken Chilli (dry / gravy)",
    priceCents: 1699,
    description: "Stir fried onions, tomatoes, green pepper, chili & sauce.",
  },
  {
    category: "CHILLI",
    sortOrder: 2,
    name: "Szechuan Pork Belly",
    priceCents: 1699,
    description: "Stir fried onions, tomatoes, green pepper, chili & sauce.",
  },
  {
    category: "CHILLI",
    sortOrder: 3,
    name: "Buff Chilli",
    priceCents: 1699,
    description: "Stir fried onions, tomatoes, green pepper, chili & sauce.",
  },

  // NEPALI MOMO
  {
    category: "NEPALI MOMO",
    sortOrder: 0,
    name: "Veg momo",
    priceCents: 1499,
    description:
      "Steamed or pan-fried. Onions, chives, soya, paneer, mix veg.",
  },
  {
    category: "NEPALI MOMO",
    sortOrder: 1,
    name: "Chicken momo",
    priceCents: 1599,
    description: "Steamed or pan-fried.",
  },
  {
    category: "NEPALI MOMO",
    sortOrder: 2,
    name: "Beef momo",
    priceCents: 1599,
    description: "Steamed or pan-fried.",
  },
  {
    category: "NEPALI MOMO",
    sortOrder: 3,
    name: "Jhol momo",
    priceCents: 1599,
    description: "Served with spicy & tangy tomato based sesame & peanut sauce.",
  },
  {
    category: "NEPALI MOMO",
    sortOrder: 4,
    name: "Chili Momo",
    priceCents: 1599,
    description:
      "Fried Nepali momo, tomatoes, onions, bell peppers, green chili, sauce.",
  },

  // THAKALI KHANA SET
  {
    category: "THAKALI KHANA SET",
    sortOrder: 0,
    name: "Thakali Khana Set",
    priceCents: 2199,
    description:
      "Choice of steamed rice or buckwheat flour mush or millet flour mush, served with black lentil, mustard green, potato, gundruk (fermented veg), papad, radish pickle, tomato chutney, yogurt, mix salad.",
    optionGroups: [
      {
        label: "Curry",
        choices: [{ name: "Veg" }, { name: "Chicken" }, { name: "Mutton" }],
      },
    ],
  },

  // KATHMANDU'S FAVORITES
  {
    category: "KATHMANDU'S FAVORITES",
    sortOrder: 0,
    name: "Chicken Sizzler",
    priceCents: 2199,
    description:
      "Sizzling platter of charbroiled chicken, steamed vegetable, fries, noodles with brown mushroom sauce.",
  },
  {
    category: "KATHMANDU'S FAVORITES",
    sortOrder: 1,
    name: "Chop Suey",
    priceCents: 1899,
    description: "Deep fried noodles with vegetables in a savory sauce, egg.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }, { name: "Chicken" }, { name: "Veg" }],
      },
    ],
  },
  {
    category: "KATHMANDU'S FAVORITES",
    sortOrder: 2,
    name: "Taas & Pork Sekuwa",
    priceCents: 2199,
    description:
      "Marinated in Nepali spices and charbroiled pork served with puffed rice, mix veg salad.",
  },

  // BHUTANESE DELICACIES
  {
    category: "BHUTANESE DELICACIES (Served with Steamed Rice)",
    sortOrder: 0,
    name: "Ema Datshi",
    priceCents: 1599,
    description: "Spicy Bhutanese curry with veg, dried meat, cheese and chili.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }, { name: "Veg" }],
      },
    ],
  },
  {
    category: "BHUTANESE DELICACIES (Served with Steamed Rice)",
    sortOrder: 1,
    name: "Phaksha Paa",
    priceCents: 1799,
    description: "Pork, radish, chili.",
  },

  // NEPALI CURRIES
  {
    category: "NEPALI CURRIES (Served with Steamed Rice)",
    sortOrder: 0,
    name: "Chicken Curry",
    priceCents: 1399,
    description: "Nepali style chicken curry.",
  },
  {
    category: "NEPALI CURRIES (Served with Steamed Rice)",
    sortOrder: 1,
    name: "Mutton Curry",
    priceCents: 1499,
    description: "Nepali style mutton curry.",
  },
  {
    category: "NEPALI CURRIES (Served with Steamed Rice)",
    sortOrder: 2,
    name: "Alu Sukuti",
    priceCents: 1599,
    description: "Potatoes and dried buffalo meat stir-fried with Nepali spice.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }],
      },
    ],
  },
  {
    category: "NEPALI CURRIES (Served with Steamed Rice)",
    sortOrder: 3,
    name: "Dharane Pork & Saag",
    priceCents: 1799,
    description: "Stir-fried pork, mustard green.",
  },

  // SIDES
  {
    category: "SIDES",
    sortOrder: 0,
    name: "Rice",
    priceCents: 399,
    description: null,
  },
  {
    category: "SIDES",
    sortOrder: 1,
    name: "Fries",
    priceCents: 899,
    description: null,
  },

  // NOODLES & RICE
  {
    category: "NOODLES & RICE",
    sortOrder: 0,
    name: "Keema Noodles",
    priceCents: 1799,
    description:
      "Noodles topped with spiced minced meat and fresh vegetables, chili oil, spicy.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Chicken" }, { name: "Veg" }],
      },
    ],
  },
  {
    category: "NOODLES & RICE",
    sortOrder: 1,
    name: "Chowmein",
    priceCents: 1699,
    description:
      "Nepali style stir-fried noodles, cabbage, carrots, green chili. Add: black eye peas (ask server).",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }, { name: "Chicken" }, { name: "Veg" }],
      },
    ],
  },
  {
    category: "NOODLES & RICE",
    sortOrder: 2,
    name: "Fried Rice",
    priceCents: 1599,
    description: "Egg, peas, carrots.",
    optionGroups: [
      {
        label: "Choice",
        choices: [{ name: "Beef" }, { name: "Buff" }, { name: "Chicken" }, { name: "Veg" }],
      },
    ],
  },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: RESTAURANT_ID },
      select: { id: true, slug: true, name: true },
    });
    if (!restaurant) {
      console.error(`Restaurant not found: ${RESTAURANT_ID}`);
      process.exit(1);
    }
    console.log(`Seeding menu for "${restaurant.name}" (${restaurant.slug}) …`);

    const deleted = await prisma.menuItem.deleteMany({ where: { restaurantId: RESTAURANT_ID } });
    console.log(`Removed ${deleted.count} existing menu item(s).`);

    const data: Prisma.MenuItemCreateManyInput[] = items.map((row) => {
      const base: Prisma.MenuItemCreateManyInput = {
        restaurantId: RESTAURANT_ID,
        name: row.name,
        description: row.description ?? null,
        priceCents: row.priceCents ?? null,
        category: row.category,
        sortOrder: row.sortOrder,
      };
      if (row.optionGroups !== undefined) {
        base.optionGroups = row.optionGroups as Prisma.InputJsonValue;
      }
      return base;
    });

    const created = await prisma.menuItem.createMany({ data });
    console.log(`Inserted ${created.count} menu item(s). Public menu: /menu/${restaurant.slug}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  optionGroupsSchema,
  parseOptionGroupsFromFormField,
} from "@/lib/option-groups";
import { parsePriceToCents } from "@/lib/money";

async function getRestaurantForUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });
}

const baseFields = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1).max(80),
  price: z.string().optional(),
});

function normalizeGroups(raw: FormDataEntryValue | null) {
  const parsed = parseOptionGroupsFromFormField(raw);
  if (!parsed?.length) return null;
  const v = optionGroupsSchema.safeParse(parsed);
  return v.success ? v.data : null;
}

export async function createMenuItem(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || "",
    category: formData.get("category") || "General",
    price: formData.get("price") ?? "",
  };
  const parsed = baseFields.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid menu item" };

  const groups = normalizeGroups(formData.get("optionGroupsJson"));
  const priceTrim = parsed.data.price?.trim() ?? "";
  let priceCents: number | null = null;
  if (priceTrim) {
    const c = parsePriceToCents(priceTrim);
    if (c === null) return { ok: false, error: "Invalid price" };
    priceCents = c;
  }

  if (!groups) {
    if (priceCents === null) return { ok: false, error: "Price is required when there are no option groups" };
  }

  const maxOrder = await prisma.menuItem.aggregate({
    where: { restaurantId: restaurant.id },
    _max: { sortOrder: true },
  });

  await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      priceCents,
      optionGroups: groups ? groups : Prisma.JsonNull,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

export async function updateMenuItem(
  itemId: string,
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: restaurant.id },
  });
  if (!item) return { ok: false, error: "Item not found" };

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || "",
    category: formData.get("category") || "General",
    price: formData.get("price") ?? "",
  };
  const parsed = baseFields.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid menu item" };

  const groups = normalizeGroups(formData.get("optionGroupsJson"));
  const priceTrim = parsed.data.price?.trim() ?? "";
  let priceCents: number | null = null;
  if (priceTrim) {
    const c = parsePriceToCents(priceTrim);
    if (c === null) return { ok: false, error: "Invalid price" };
    priceCents = c;
  }

  if (!groups) {
    if (priceCents === null) return { ok: false, error: "Price is required when there are no option groups" };
  }

  await prisma.menuItem.update({
    where: { id: itemId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      category: parsed.data.category,
      priceCents,
      optionGroups: groups ? groups : Prisma.JsonNull,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

export async function deleteMenuItem(itemId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: restaurant.id },
  });
  if (!item) return { ok: false, error: "Item not found" };

  await prisma.menuItem.delete({ where: { id: itemId } });

  revalidatePath("/dashboard");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

export async function deleteMenuItemForm(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  await deleteMenuItem(id);
}

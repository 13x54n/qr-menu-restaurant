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
  category: z.string().min(1).max(120),
  price: z.string().optional(),
});

const MAX_MENU_CATEGORIES = 40;

function normalizeMenuCategoryLabels(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const t = s.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_MENU_CATEGORIES) break;
  }
  return out;
}

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
  revalidatePath("/dashboard/menu");
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
  revalidatePath("/dashboard/menu");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

export async function toggleMenuItemOutOfStock(
  itemId: string,
): Promise<{ ok: true; outOfStock: boolean } | { ok: false; error: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: restaurant.id },
    select: { id: true, outOfStock: true },
  });
  if (!item) return { ok: false, error: "Item not found" };

  const outOfStock = !item.outOfStock;
  await prisma.menuItem.update({
    where: { id: itemId },
    data: { outOfStock },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true, outOfStock };
}

export async function updateRestaurantMenuCategories(
  labels: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const restaurant = await getRestaurantForUser();
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  if (!Array.isArray(labels)) return { ok: false, error: "Invalid categories" };

  const normalized = normalizeMenuCategoryLabels(
    labels.filter((x): x is string => typeof x === "string"),
  );

  const labelSchema = z.string().min(1).max(120);
  for (const t of normalized) {
    if (!labelSchema.safeParse(t).success) {
      return { ok: false, error: "Each category must be 1–120 characters" };
    }
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: { menuCategories: normalized },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
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
  revalidatePath("/dashboard/menu");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

export async function deleteMenuItemForm(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  await deleteMenuItem(id);
}

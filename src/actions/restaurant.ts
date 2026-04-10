"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const optionalUrl = z.union([z.literal(""), z.string().url()]);

const brandingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  logoUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
});

function emptyToNull(s: string | undefined): string | null {
  const t = s?.trim();
  return t ? t : null;
}

export async function updateRestaurantBranding(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId: session.user.id },
  });
  if (!restaurant) return { ok: false, error: "No restaurant found" };

  const raw = {
    name: String(formData.get("name") ?? ""),
    logoUrl: String(formData.get("logoUrl") ?? ""),
    instagramUrl: String(formData.get("instagramUrl") ?? ""),
    tiktokUrl: String(formData.get("tiktokUrl") ?? ""),
  };

  const parsed = brandingSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid input",
    };
  }

  await prisma.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: parsed.data.name,
      logoUrl: emptyToNull(parsed.data.logoUrl),
      instagramUrl: emptyToNull(parsed.data.instagramUrl),
      tiktokUrl: emptyToNull(parsed.data.tiktokUrl),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath(`/menu/${restaurant.slug}`);
  return { ok: true };
}

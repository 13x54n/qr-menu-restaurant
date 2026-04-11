import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  restaurantName: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
});

export type CreateRestaurantOwnerInput = z.infer<typeof schema>;

/**
 * Creates a User and their Restaurant (same rules as the former public register flow).
 * For local / private provisioning only.
 */
export async function createRestaurantOwner(
  input: CreateRestaurantOwnerInput,
): Promise<{ ok: true; email: string; slug: string } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.slug?.[0] ??
      parsed.error.issues[0]?.message ??
      "Invalid input";
    return { ok: false, error: msg };
  }

  const { name, email, password, restaurantName, slug } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { ok: false, error: "An account with this email already exists" };

  const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
  if (existingSlug) return { ok: false, error: "That restaurant URL is already taken" };

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      restaurants: {
        create: {
          slug,
          name: restaurantName,
        },
      },
    },
  });

  return { ok: true, email, slug };
}

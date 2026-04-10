"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  restaurantName: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens"),
});

function formError(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

export async function registerAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    restaurantName: formData.get("restaurantName"),
    slug: String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase(),
  });

  if (!parsed.success) {
    return formError(parsed.error.flatten().fieldErrors.slug?.[0] ?? "Invalid input");
  }

  const { name, email, password, restaurantName, slug } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingUser) return formError("An account with this email already exists");

  const existingSlug = await prisma.restaurant.findUnique({ where: { slug } });
  if (existingSlug) return formError("That restaurant URL is already taken");

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
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

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof AuthError) return formError("Could not sign you in after registration");
    throw e;
  }

  return { ok: true };
}

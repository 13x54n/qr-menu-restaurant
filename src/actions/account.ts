"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function badPasswordMessage(): { ok: false; error: string } {
  return { ok: false, error: "Could not verify password." };
}

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export async function updateAccountPassword(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { ok: false, error: "New password and confirmation do not match." };
  }

  const parsedNew = passwordSchema.safeParse(newPassword);
  if (!parsedNew.success) {
    return { ok: false, error: parsedNew.error.flatten().formErrors[0] ?? "Invalid password" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Account not found." };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return badPasswordMessage();

  const passwordHash = await bcrypt.hash(parsedNew.data, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { ok: true };
}

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export async function updateAccountEmail(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true; reauth: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const password = String(formData.get("password") ?? "");
  const newEmailRaw = String(formData.get("newEmail") ?? "");
  const parsedEmail = emailSchema.safeParse(newEmailRaw);
  if (!parsedEmail.success) {
    return { ok: false, error: parsedEmail.error.flatten().formErrors[0] ?? "Invalid email" };
  }

  const newEmail = parsedEmail.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Account not found." };

  if (newEmail === user.email.toLowerCase()) {
    return { ok: false, error: "That is already your email address." };
  }

  const taken = await prisma.user.findUnique({ where: { email: newEmail } });
  if (taken) return { ok: false, error: "An account with that email already exists." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return badPasswordMessage();

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail },
  });

  return { ok: true, reauth: true };
}

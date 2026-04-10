"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = formData.get("email");
  const password = formData.get("password");
  const rawCallback = (formData.get("callbackUrl") as string) || "/dashboard";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//") ? rawCallback : "/dashboard";

  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, error: "Missing email or password" };
  }

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: callbackUrl,
    });
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: "Invalid email or password" };
    throw e;
  }

  return { ok: true };
}

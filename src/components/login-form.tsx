"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/login";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form
      action={action}
      className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm sm:p-8"
    >
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <h1 className="font-serif text-2xl font-semibold text-zinc-900">Sign in</h1>
      {state && "ok" in state && !state.ok ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-zinc-500">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-500">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-amber-800 hover:underline">
          Register your restaurant
        </Link>
      </p>
    </form>
  );
}

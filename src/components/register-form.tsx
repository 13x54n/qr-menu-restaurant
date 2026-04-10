"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "@/actions/register";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);

  return (
    <form action={action} className="mx-auto max-w-md space-y-4 rounded-2xl border border-amber-200/80 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold text-zinc-900">Create your restaurant</h1>
      {state && "ok" in state && !state.ok ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium text-zinc-500">Your name</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
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
        <span className="text-xs font-medium text-zinc-500">Password (min 8 characters)</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-500">Restaurant name</span>
        <input
          name="restaurantName"
          required
          className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          placeholder="The Corner Bistro"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-zinc-500">Subdomain (your public URL)</span>
        <div className="mt-1 flex rounded-lg border border-zinc-200 bg-zinc-50 text-sm">
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
            className="min-w-0 flex-1 rounded-l-lg bg-white px-3 py-2 outline-none"
            placeholder="corner-bistro"
          />
          <span className="flex items-center pr-3 text-zinc-400">
            .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || "app.ca"}
          </span>
        </div>
        <span className="mt-1 block text-xs text-zinc-400">
          Local dev: use <code className="rounded bg-zinc-100 px-1">yourslug.localhost:3000</code>
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Register"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-amber-800 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

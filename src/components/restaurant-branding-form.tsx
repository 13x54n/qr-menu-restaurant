"use client";

import { useActionState } from "react";
import { updateRestaurantBranding } from "@/actions/restaurant";

type Props = {
  initialLogoUrl: string | null;
  initialInstagramUrl: string | null;
  initialTiktokUrl: string | null;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40";

export function RestaurantBrandingForm({
  initialLogoUrl,
  initialInstagramUrl,
  initialTiktokUrl,
}: Props) {
  const [state, action, pending] = useActionState(updateRestaurantBranding, null);

  return (
    <form
      action={action}
      className="rounded-2xl border border-stone-700/90 bg-stone-900/60 p-6 shadow-lg shadow-black/30 backdrop-blur-sm"
    >
      <h2 className="font-serif text-lg font-medium text-stone-50">Branding &amp; social</h2>
      <p className="mt-1 text-sm text-stone-400">
        Shown on your public menu header. Use full URLs (https://…).
      </p>
      {state && "ok" in state && !state.ok ? (
        <p className="mt-3 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-1">
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Logo image URL</span>
          <input
            name="logoUrl"
            type="url"
            defaultValue={initialLogoUrl ?? ""}
            className={inputClass}
            placeholder="https://…"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Instagram</span>
          <input
            name="instagramUrl"
            type="url"
            defaultValue={initialInstagramUrl ?? ""}
            className={inputClass}
            placeholder="https://instagram.com/…"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-400">TikTok</span>
          <input
            name="tiktokUrl"
            type="url"
            defaultValue={initialTiktokUrl ?? ""}
            className={inputClass}
            placeholder="https://tiktok.com/…"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-stone-950 hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}

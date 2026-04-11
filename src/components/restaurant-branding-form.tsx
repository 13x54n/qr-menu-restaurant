"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { updateRestaurantBranding } from "@/actions/restaurant";
import { Button } from "@/components/ui/button";

type Props = {
  initialName: string;
  initialLogoUrl: string | null;
  initialInstagramUrl: string | null;
  initialTiktokUrl: string | null;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-600 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40";

function isProbablyValidImageUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function RestaurantBrandingForm({
  initialName,
  initialLogoUrl,
  initialInstagramUrl,
  initialTiktokUrl,
}: Props) {
  const [state, action, pending] = useActionState(updateRestaurantBranding, null);
  const [logoUrlDraft, setLogoUrlDraft] = useState(initialLogoUrl ?? "");
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    setLogoUrlDraft(initialLogoUrl ?? "");
  }, [initialLogoUrl]);

  const showLogoPreview = useMemo(() => isProbablyValidImageUrl(logoUrlDraft), [logoUrlDraft]);

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrlDraft]);

  return (
    <form
      action={action}
      className="rounded-2xl border border-stone-700/90 bg-stone-900/60 p-4 shadow-lg shadow-black/30 backdrop-blur-sm sm:p-6"
    >
      <h2 className="text-lg font-medium text-stone-50">Branding &amp; social</h2>
      <p className="mt-1 text-sm text-stone-400">
        Restaurant name and logo appear on your public menu header. Social links use full URLs
        (https://…). Logo preview updates as you type a valid URL.
      </p>
      {state && "ok" in state && !state.ok ? (
        <p className="mt-3 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-1">
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Restaurant name</span>
          <input
            name="name"
            type="text"
            required
            defaultValue={initialName}
            maxLength={120}
            autoComplete="organization"
            className={inputClass}
            placeholder="Your restaurant name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-400">Logo image URL</span>
          <input
            name="logoUrl"
            type="url"
            value={logoUrlDraft}
            onChange={(e) => setLogoUrlDraft(e.target.value)}
            className={inputClass}
            placeholder="https://…"
          />
        </label>
        {showLogoPreview ? (
          <div className="rounded-lg border border-stone-700/80 bg-stone-950/80 p-3">
            <p className="mb-2 text-xs font-medium text-stone-500">Preview</p>
            <div className="flex min-h-[72px] items-center justify-center rounded-md bg-stone-900/80 p-2">
              {logoLoadError ? (
                <p className="text-center text-sm text-stone-500">Could not load image from this URL.</p>
              ) : (
                <img
                  src={logoUrlDraft.trim()}
                  alt="Logo preview"
                  className="max-h-24 max-w-full object-contain"
                  onError={() => setLogoLoadError(true)}
                />
              )}
            </div>
          </div>
        ) : null}
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
      <Button type="submit" disabled={pending} className="mt-4">
        {pending ? "Saving…" : "Save branding"}
      </Button>
    </form>
  );
}

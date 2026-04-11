"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  url: string;
  /** Used for the downloaded filename, e.g. `laligurans-menu-qr.png`. */
  slug: string;
};

export function PublicMenuQr({ url, slug }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setError(null);
    if (!url.trim()) return;

    QRCode.toDataURL(url, {
      margin: 2,
      width: 240,
      color: { dark: "#0c0a09", light: "#fafaf9" },
      errorCorrectionLevel: "M",
    })
      .then((src) => {
        if (!cancelled) setDataUrl(src);
      })
      .catch(() => {
        if (!cancelled) setError("Could not generate QR code.");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const safeSlug = slug.replace(/[^a-z0-9-]+/gi, "-").slice(0, 48) || "menu";
  const downloadName = `${safeSlug}-menu-qr.png`;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-stone-500">QR for tables</p>
      <p className="mt-1 text-xs text-stone-500">Scan to open your public menu. Download the PNG for print.</p>
      <p className="mt-2 min-w-0 break-all text-[11px] leading-snug text-stone-400">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400/90 underline decoration-amber-700/50 underline-offset-2 hover:text-amber-300"
        >
          Open menu in browser
        </a>
        <span className="text-stone-600"> · </span>
        <span className="text-stone-500">{url}</span>
      </p>
      <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-[200px] w-[200px] shrink-0 items-center justify-center rounded-lg border border-stone-700 bg-stone-950 p-2">
          {error ? (
            <p className="px-2 text-center text-xs text-red-400">{error}</p>
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="QR code that opens your public menu"
              className="max-h-full max-w-full object-contain"
              width={200}
              height={200}
            />
          ) : (
            <p className="text-xs text-stone-500">Generating…</p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:min-w-0 sm:flex-1">
          {dataUrl ? (
            <a
              href={dataUrl}
              download={downloadName}
              className="inline-flex w-full items-center justify-center rounded-lg border border-amber-600/70 bg-amber-500/10 px-4 py-2.5 text-center text-sm font-medium text-amber-300 hover:bg-amber-500/20 sm:w-auto sm:justify-start"
            >
              Download QR (PNG)
            </a>
          ) : null}
          <p className="text-center text-[11px] text-stone-500 sm:text-left">
            Encodes this public menu URL. Regenerates automatically if the URL changes.
          </p>
        </div>
      </div>
    </div>
  );
}

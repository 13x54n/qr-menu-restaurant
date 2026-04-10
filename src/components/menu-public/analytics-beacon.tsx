"use client";

import { useEffect } from "react";

const STORAGE_KEY = "qr_menu_vid";

function getOrCreateVisitorId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
  } catch {
    /* private mode */
  }
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

/** Throttle: at most one visit row per slug per 45s per tab (reduces refresh spam). */
const throttleKey = (slug: string) => `qr_beacon_${slug}`;

const HEARTBEAT_MS = 60_000;

function post(
  slug: string,
  visitorId: string,
  kind: "view" | "heartbeat" | "leave",
  keepalive?: boolean,
) {
  return fetch("/api/analytics/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, visitorId, kind }),
    keepalive: keepalive ?? kind === "leave",
  }).catch(() => {});
}

type Props = { slug: string };

export function AnalyticsBeacon({ slug }: Props) {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    let viewSent = false;
    try {
      const last = sessionStorage.getItem(throttleKey(slug));
      const now = Date.now();
      if (!last || now - Number.parseInt(last, 10) >= 45_000) {
        sessionStorage.setItem(throttleKey(slug), String(now));
        viewSent = true;
        void post(slug, visitorId, "view");
      }
    } catch {
      viewSent = true;
      void post(slug, visitorId, "view");
    }

    if (!viewSent) {
      void post(slug, visitorId, "heartbeat");
    }

    const tick = () => {
      if (document.visibilityState !== "visible") return;
      void post(slug, visitorId, "heartbeat");
    };

    const interval = window.setInterval(tick, HEARTBEAT_MS);

    const sendLeave = () => {
      void post(slug, visitorId, "leave", true);
    };

    window.addEventListener("pagehide", sendLeave);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendLeave();
      } else {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", sendLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      sendLeave();
    };
  }, [slug]);

  return null;
}

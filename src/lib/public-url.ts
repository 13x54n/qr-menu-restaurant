function parseAuthUrl(): URL | null {
  const raw = process.env.AUTH_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function menuRootFromEnv(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").trim().split(":")[0].toLowerCase();
}

function isLocalAuthHost(auth: URL): boolean {
  return (
    auth.hostname === "localhost" ||
    auth.hostname === "127.0.0.1" ||
    auth.hostname.endsWith(".local")
  );
}

/** Parent host for slug.<parent> when using local-style AUTH_URL (defaults to AUTH_URL hostname). */
function localMenuParentHost(auth: URL): string {
  const override = process.env.NEXT_PUBLIC_MENU_PARENT_HOST?.trim();
  return override || auth.hostname;
}

function menuPublicUrlOrThrow(slug: string): string {
  const auth = parseAuthUrl();
  if (!auth) {
    throw new Error("menuPublicUrl requires AUTH_URL");
  }
  const port = auth.port ? `:${auth.port}` : "";
  if (isLocalAuthHost(auth)) {
    const parent = localMenuParentHost(auth);
    return `${auth.protocol}//${slug}.${parent}${port}`;
  }
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (!root) {
    throw new Error("menuPublicUrl requires NEXT_PUBLIC_ROOT_DOMAIN when AUTH_URL is not a local host");
  }
  return `${auth.protocol}//${slug}.${root}`;
}

/** Hostname where guest menus live: https://slug.<this> */
export function menuPublicHostname(): string {
  return menuRootFromEnv();
}

/** Suffix after the slug in forms, e.g. ".minginc.xyz" */
export function menuPublicDomainSuffix(): string {
  const h = menuPublicHostname();
  return h ? `.${h}` : "";
}

/**
 * When the owner app runs on a reserved subdomain (NEXT_PUBLIC_APP_SUBDOMAIN),
 * e.g. qr.minginc.xyz — for UI hints. Uses AUTH_URL for scheme, host, and port when local.
 */
export function ownerDashboardUrlHint(): string | null {
  const appSub = process.env.NEXT_PUBLIC_APP_SUBDOMAIN?.trim().toLowerCase();
  if (!appSub) return null;
  const auth = parseAuthUrl();
  const root = menuRootFromEnv();
  if (auth && isLocalAuthHost(auth)) {
    const port = auth.port ? `:${auth.port}` : "";
    const parent = localMenuParentHost(auth);
    return `${auth.protocol}//${appSub}.${parent}${port}`;
  }
  if (!root) return null;
  if (!auth) return null;
  return `${auth.protocol}//${appSub}.${root}`;
}

/** Example guest-facing menu URL for UI copy; empty if AUTH_URL (and non-local: NEXT_PUBLIC_ROOT_DOMAIN) is missing. */
export function formatGuestMenuUrlExample(slugLabel: string): string {
  const auth = parseAuthUrl();
  const root = menuRootFromEnv();
  if (auth && isLocalAuthHost(auth)) {
    const port = auth.port ? `:${auth.port}` : "";
    const parent = localMenuParentHost(auth);
    return `${auth.protocol}//${slugLabel}.${parent}${port}`;
  }
  if (!root || !auth) return "";
  return `${auth.protocol}//${slugLabel}.${root}`;
}

/** Build the public URL for a restaurant's QR menu (subdomain). */
export function menuPublicUrl(slug: string): string {
  return menuPublicUrlOrThrow(slug);
}

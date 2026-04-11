/**
 * Resolves the tenant slug from the Host header.
 * Production: restauranta.app.ca → "restauranta" when NEXT_PUBLIC_ROOT_DOMAIN=app.ca
 * Local: restauranta.localhost:3000 → "restauranta" when NEXT_PUBLIC_ROOT_DOMAIN=localhost
 *
 * When NEXT_PUBLIC_APP_SUBDOMAIN is set (e.g. qr), that host is the main app (login/dashboard),
 * not a menu tenant — e.g. qr.minginc.xyz with ROOT_DOMAIN=minginc.xyz.
 */
export function getSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost")
    .split(":")[0]
    .toLowerCase();

  if (hostname === root || hostname === `www.${root}`) return null;

  const appSub = process.env.NEXT_PUBLIC_APP_SUBDOMAIN?.trim().toLowerCase();
  if (appSub && hostname === `${appSub}.${root}`) return null;

  const suffix = `.${root}`;
  if (!hostname.endsWith(suffix)) return null;

  const sub = hostname.slice(0, -suffix.length);
  if (!sub || sub.includes(".")) return null;
  return sub;
}

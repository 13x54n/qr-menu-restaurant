/** Build the public URL for a restaurant's QR menu (subdomain). */
export function menuPublicUrl(slug: string): string {
  const authUrl = process.env.AUTH_URL || "http://localhost:3000";
  const u = new URL(authUrl);
  const port = u.port ? `:${u.port}` : "";
  const isLocal =
    u.hostname === "localhost" ||
    u.hostname === "127.0.0.1" ||
    u.hostname.endsWith(".local");

  if (isLocal) {
    return `${u.protocol}//${slug}.localhost${port}`;
  }

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "app.ca";
  return `${u.protocol}//${slug}.${root}`;
}

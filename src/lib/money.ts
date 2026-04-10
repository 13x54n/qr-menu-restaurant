export function formatPrice(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function parsePriceToCents(input: string): number | null {
  const trimmed = input.trim().replace(/^\$/, "");
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

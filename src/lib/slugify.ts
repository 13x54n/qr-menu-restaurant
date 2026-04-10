/** Stable id for menu category chips (lowercase, hyphenated). */
export function slugifyCategory(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

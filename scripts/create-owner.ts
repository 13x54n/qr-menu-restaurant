/**
 * Create a restaurant owner + restaurant from the CLI (replaces the disabled web /register flow).
 *
 * Usage (from repo root, with DATABASE_URL set — e.g. load .env in your shell first):
 *   npm run db:create-owner -- --email you@example.com --password 'your-secure-pass' --name "Your Name" --restaurant "Bistro Name" --slug your-slug
 */

import { createRestaurantOwner } from "../src/lib/create-restaurant-owner";

function arg(name: string): string | undefined {
  const eq = `--${name}=`;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith(eq)) return a.slice(eq.length);
  }
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return undefined;
}

function usage(): never {
  console.error(`Usage:
  npm run db:create-owner -- \\
    --email <email> \\
    --password <password> \\
    --name "<owner display name>" \\
    --restaurant "<restaurant name>" \\
    --slug <subdomain-slug>

Slug: lowercase letters, numbers, single hyphens (e.g. corner-bistro).
Password: at least 8 characters.

Ensure DATABASE_URL is set (same as Prisma / Next.js). Example:
  export $(grep -v '^#' .env | xargs)   # zsh/bash; review before running
  npm run db:create-owner -- --email ...`);
  process.exit(1);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Load your .env or export DATABASE_URL.");
    process.exit(1);
  }

  const email = arg("email");
  const password = arg("password");
  const name = arg("name");
  const restaurant = arg("restaurant");
  const slug = arg("slug");

  if (!email || !password || !name || !restaurant || !slug) usage();

  const result = await createRestaurantOwner({
    email,
    password,
    name,
    restaurantName: restaurant,
    slug,
  });

  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(`Created owner ${result.email} with restaurant slug "${result.slug}".`);
  console.log("Sign in at /login with that email and password.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

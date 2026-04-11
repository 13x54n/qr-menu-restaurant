# QR Menu (restaurant)

Next.js app for multi-tenant restaurant menus (dashboard + public menu by subdomain).

## Requirements

- Node.js 20+
- PostgreSQL and a `DATABASE_URL` in `.env` (see Prisma)

## Setup

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Public web **registration is disabled**; owners are created locally (below).

## Creating an owner (local / private)

There is **no** `/register` page. To add a user and their restaurant (same validation as the old register form):

1. Ensure `DATABASE_URL` is set (e.g. from `.env` in your shell — however you normally run Prisma/Next).
2. From the repo root:

```bash
npm run db:create-owner -- \
  --email you@example.com \
  --password 'your-secure-password' \
  --name "Owner display name" \
  --restaurant "Restaurant name" \
  --slug your-subdomain
```

**Rules**

- **Password:** at least 8 characters.
- **Slug:** lowercase letters, numbers, and single hyphens only (e.g. `corner-bistro`). Must be unique in the database.
- **Email:** must be unique.

Then sign in at `/login` with that email and password.

## Other scripts

- **Seed sample menu (fixed restaurant id):** `npm run db:seed:laligurans` — see `scripts/seed-laligurans-menu.ts`.

## Development notes

- **Edge middleware:** `src/middleware.ts` uses `getToken` from `next-auth/jwt` instead of importing the full `auth()` config, to keep the Edge bundle small (Vercel limit).
- **Agents / Next.js:** see [AGENTS.md](AGENTS.md) for framework notes.

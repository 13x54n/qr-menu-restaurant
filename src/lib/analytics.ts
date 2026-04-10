import "server-only";

import { prisma } from "@/lib/prisma";
import type { VisitChartSeries } from "@/lib/analytics-shared";

export type { VisitChartSeries } from "@/lib/analytics-shared";

function utcStartOfToday(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

function toIsoDateUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function labelForDay(isoDate: string): string {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function labelForMonth(ym: string): string {
  const [y, mo] = ym.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, 1));
  return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function rollingUtcDayKeys(count: number): { keys: string[]; since: Date } {
  const today = utcStartOfToday();
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (count - 1));
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    keys.push(toIsoDateUtc(d));
  }
  return { keys, since: start };
}

function rollingUtcMonthKeys(count: number): { keys: string[]; since: Date } {
  const n = new Date();
  const y = n.getUTCFullYear();
  const monthIndex = n.getUTCMonth();
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, monthIndex - i, 1));
    keys.push(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  }
  const first = keys[0]!.split("-").map(Number);
  const since = new Date(Date.UTC(first[0]!, first[1]! - 1, 1));
  return { keys, since };
}

export async function getVisitChartSeries(restaurantId: string): Promise<VisitChartSeries> {
  const now = new Date();

  const w = rollingUtcDayKeys(7);
  const m = rollingUtcDayKeys(30);
  const y = rollingUtcMonthKeys(12);

  const [wRows, mRows, yRows] = await Promise.all([
    prisma.$queryRaw<{ d: Date; c: number }[]>`
      SELECT (("visitedAt" AT TIME ZONE 'UTC')::date) AS d, COUNT(*)::int AS c
      FROM "AnalyticsVisit"
      WHERE "restaurantId" = ${restaurantId}
        AND "visitedAt" >= ${w.since}
        AND "visitedAt" <= ${now}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ d: Date; c: number }[]>`
      SELECT (("visitedAt" AT TIME ZONE 'UTC')::date) AS d, COUNT(*)::int AS c
      FROM "AnalyticsVisit"
      WHERE "restaurantId" = ${restaurantId}
        AND "visitedAt" >= ${m.since}
        AND "visitedAt" <= ${now}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<{ ym: string; c: number }[]>`
      SELECT to_char(
        date_trunc('month', ("visitedAt" AT TIME ZONE 'UTC')),
        'YYYY-MM'
      ) AS ym, COUNT(*)::int AS c
      FROM "AnalyticsVisit"
      WHERE "restaurantId" = ${restaurantId}
        AND "visitedAt" >= ${y.since}
        AND "visitedAt" <= ${now}
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  const wMap = new Map<string, number>();
  for (const row of wRows) {
    const key = toIsoDateUtc(new Date(row.d));
    wMap.set(key, row.c);
  }
  const mMap = new Map<string, number>();
  for (const row of mRows) {
    const key = toIsoDateUtc(new Date(row.d));
    mMap.set(key, row.c);
  }
  const yMap = new Map<string, number>();
  for (const row of yRows) {
    yMap.set(row.ym, row.c);
  }

  const endIso = now.toISOString();
  return {
    bounds: {
      w1: { startUtc: w.since.toISOString(), endUtc: endIso },
      m1: { startUtc: m.since.toISOString(), endUtc: endIso },
      y1: { startUtc: y.since.toISOString(), endUtc: endIso },
    },
    w1: w.keys.map((bucket) => ({
      bucket,
      label: labelForDay(bucket),
      visits: wMap.get(bucket) ?? 0,
    })),
    m1: m.keys.map((bucket) => ({
      bucket,
      label: labelForDay(bucket),
      visits: mMap.get(bucket) ?? 0,
    })),
    y1: y.keys.map((bucket) => ({
      bucket,
      label: labelForMonth(bucket),
      visits: yMap.get(bucket) ?? 0,
    })),
  };
}

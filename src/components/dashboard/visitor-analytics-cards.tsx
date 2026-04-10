import type { VisitChartSeries } from "@/lib/analytics-shared";
import { VisitRangeCharts } from "@/components/dashboard/visit-range-charts";

type Props = { series: VisitChartSeries };

/** Load `series` in a Server Component via `getVisitChartSeries`. */
export function VisitorAnalyticsCards({ series }: Props) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-stone-300">Menu visits</h2>
      <VisitRangeCharts series={series} />
      <p className="mt-3 text-xs text-stone-500">
        Each menu load counts as a visit (reloads count again). Charts bucket by UTC day or month.
        Subdomain traffic and{" "}
        <code className="rounded bg-stone-950 px-1 py-0.5 text-stone-400">/menu/your-slug</code> both
        count.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { VisitChartSeries } from "@/lib/analytics-shared";

const chartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(43 96% 56%)",
  },
} satisfies ChartConfig;

type Props = { series: VisitChartSeries };

function formatUtcDateTime(iso: string): string {
  return (
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }) + " UTC"
  );
}

type RangeKey = "w1" | "m1" | "y1";

function RangeChart({
  data,
  tickAngle,
  tickInterval,
}: {
  data: { label: string; visits: number }[];
  tickAngle?: number;
  tickInterval?: number;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full sm:h-[220px]">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="oklch(0.35 0.01 80 / 0.5)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={tickInterval}
          minTickGap={tickAngle ? 4 : 8}
          angle={tickAngle}
          textAnchor={tickAngle ? "end" : "middle"}
          height={tickAngle ? 56 : 32}
          tick={{ fill: "oklch(0.55 0.01 80)", fontSize: 10 }}
        />
        <YAxis
          domain={[0, "auto"]}
          tickLine={false}
          axisLine={false}
          width={36}
          tickMargin={4}
          tick={{ fill: "oklch(0.55 0.01 80)", fontSize: 10 }}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="border-stone-700 bg-stone-950"
              hideLabel
              formatter={(value) => (
                <span className="font-mono tabular-nums text-stone-100">
                  {typeof value === "number" ? value.toLocaleString() : String(value)}
                </span>
              )}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="var(--color-visits)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}

const rangeTriggerClass = cn(
  "h-9 min-w-0 flex-1 px-2 text-sm font-semibold tabular-nums",
  "text-muted-foreground hover:text-foreground",
  "data-[state=on]:z-[1] data-[state=on]:border-input data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
);

export function VisitRangeCharts({ series }: Props) {
  const { bounds, w1, m1, y1 } = series;
  const [range, setRange] = useState<RangeKey>("w1");

  return (
    <div className="rounded-xl border border-stone-700/90 bg-stone-900/60 p-2 shadow-lg shadow-black/20 sm:p-3">
      <div className="mb-3">
        <span className="sr-only" id="visit-range-label">
          Chart time range
        </span>
        <ToggleGroup
          aria-labelledby="visit-range-label"
          multiple={false}
          spacing={0}
          variant="outline"
          value={[range]}
          onValueChange={(next) => {
            if (next.length > 0) setRange(next[0] as RangeKey);
          }}
          className="flex h-9 w-full rounded-lg bg-muted/50 p-0.5 shadow-inner shadow-black/20"
        >
          <ToggleGroupItem value="w1" aria-label="Last 7 days" className={rangeTriggerClass}>
            7
          </ToggleGroupItem>
          <ToggleGroupItem value="m1" aria-label="Last 30 days" className={rangeTriggerClass}>
            30
          </ToggleGroupItem>
          <ToggleGroupItem value="y1" aria-label="Last 365 days" className={rangeTriggerClass}>
            365
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {range === "w1" ? (
        <>
          <p className="mb-2 text-[11px] text-stone-500">
            Daily visits · {formatUtcDateTime(bounds.w1.startUtc)} → {formatUtcDateTime(bounds.w1.endUtc)}
          </p>
          <RangeChart data={w1} />
        </>
      ) : null}
      {range === "m1" ? (
        <>
          <p className="mb-2 text-[11px] text-stone-500">
            Daily visits · {formatUtcDateTime(bounds.m1.startUtc)} → {formatUtcDateTime(bounds.m1.endUtc)}
          </p>
          <RangeChart data={m1} tickAngle={-45} tickInterval={2} />
        </>
      ) : null}
      {range === "y1" ? (
        <>
          <p className="mb-2 text-[11px] text-stone-500">
            Monthly visits · {formatUtcDateTime(bounds.y1.startUtc)} → {formatUtcDateTime(bounds.y1.endUtc)}
          </p>
          <RangeChart data={y1} />
        </>
      ) : null}
    </div>
  );
}

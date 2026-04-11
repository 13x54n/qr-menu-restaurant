"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function RangeTabTrigger({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "h-8 min-w-0 flex-1 px-2 text-sm font-semibold tabular-nums",
        "data-active:bg-stone-800 data-active:text-stone-50 data-active:shadow-sm",
        "text-stone-500 hover:text-stone-300",
      )}
    >
      {label}
    </TabsTrigger>
  );
}

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

export function VisitRangeCharts({ series }: Props) {
  const { bounds, w1, m1, y1 } = series;

  return (
    <div className="rounded-xl border border-stone-700/90 bg-stone-900/60 p-2 shadow-lg shadow-black/20 sm:p-3">
      <Tabs defaultValue="w1" className="w-full">
        <TabsList
          variant="default"
          className="mb-3 h-8 w-full flex-wrap justify-stretch gap-1 rounded-lg border border-stone-700/80 bg-stone-950/50 p-[3px]"
        >
          <RangeTabTrigger value="w1" label="7" />
          <RangeTabTrigger value="m1" label="30" />
          <RangeTabTrigger value="y1" label="365" />
        </TabsList>
        <TabsContent value="w1" className="mt-0">
          <p className="mb-2 text-[11px] text-stone-500">
            Daily visits · {formatUtcDateTime(bounds.w1.startUtc)} → {formatUtcDateTime(bounds.w1.endUtc)}
          </p>
          <RangeChart data={w1} />
        </TabsContent>
        <TabsContent value="m1" className="mt-0">
          <p className="mb-2 text-[11px] text-stone-500">
            Daily visits · {formatUtcDateTime(bounds.m1.startUtc)} → {formatUtcDateTime(bounds.m1.endUtc)}
          </p>
          <RangeChart data={m1} tickAngle={-45} tickInterval={2} />
        </TabsContent>
        <TabsContent value="y1" className="mt-0">
          <p className="mb-2 text-[11px] text-stone-500">
            Monthly visits · {formatUtcDateTime(bounds.y1.startUtc)} → {formatUtcDateTime(bounds.y1.endUtc)}
          </p>
          <RangeChart data={y1} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

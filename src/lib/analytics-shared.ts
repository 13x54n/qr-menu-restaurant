/** ISO date `YYYY-MM-DD` or month key `YYYY-MM` (UTC buckets). */
export type VisitSeriesPoint = {
  bucket: string;
  label: string;
  visits: number;
};

/** Inclusive window used for the chart queries (UTC, ISO 8601). */
export type VisitRangeBounds = {
  startUtc: string;
  endUtc: string;
};

export type VisitChartSeries = {
  bounds: {
    w1: VisitRangeBounds;
    m1: VisitRangeBounds;
    y1: VisitRangeBounds;
  };
  w1: VisitSeriesPoint[];
  m1: VisitSeriesPoint[];
  y1: VisitSeriesPoint[];
};

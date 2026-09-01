export type ChartDataUpdateMode =
  | "INITIAL"
  | "IDENTITY_CHANGE"
  | "APPEND"
  | "REPLACE";

type ChartDataUpdateInput = {
  initialized: boolean;
  previousChartId: number | null;
  chartId: number;
  previousLength: number;
  previousLastTime: number | null;
  candleTimes: number[];
};

/**
 * APPEND is safe only when this is the same chart and the previously rendered
 * last candle still occupies the same position. Any other replacement gets a
 * full setData so unrelated timestamps can never survive in the series.
 */
export function getChartDataUpdateMode({
  initialized,
  previousChartId,
  chartId,
  previousLength,
  previousLastTime,
  candleTimes,
}: ChartDataUpdateInput): ChartDataUpdateMode {
  if (!initialized) return "INITIAL";
  if (previousChartId !== chartId) return "IDENTITY_CHANGE";

  const preservesPreviousTail =
    previousLength > 0 &&
    candleTimes.length > previousLength &&
    candleTimes[previousLength - 1] === previousLastTime;

  return preservesPreviousTail ? "APPEND" : "REPLACE";
}

export function shouldResetChartViewport(mode: ChartDataUpdateMode) {
  return mode === "INITIAL" || mode === "IDENTITY_CHANGE";
}

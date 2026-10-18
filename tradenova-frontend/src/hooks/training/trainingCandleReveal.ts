import type {
  Candle,
  ProgressResponse,
  RevealedCandle,
  TrainingChartDto,
} from "@/types/training";

export function revealedCandleToCandle(candle: RevealedCandle): Candle {
  return { ...candle };
}

/** Merges server-revealed candles by their canonical, zero-based chart index. */
export function appendRevealedCandles(
  current: Candle[],
  revealed: RevealedCandle[],
): Candle[] {
  if (revealed.length === 0) return current;

  const byIndex = new Map<number, Candle>();
  current.forEach((candle, position) => {
    byIndex.set(candle.idx ?? position, candle);
  });
  revealed.forEach((candle) => {
    if (!byIndex.has(candle.idx)) {
      byIndex.set(candle.idx, revealedCandleToCandle(candle));
    }
  });

  return [...byIndex.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, candle]) => candle);
}

export function appendRevealedCandlesForChart(
  candlesByChart: Record<number, Candle[]>,
  progress: ProgressResponse,
): Record<number, Candle[]> {
  return {
    ...candlesByChart,
    [progress.chartId]: appendRevealedCandles(
      candlesByChart[progress.chartId] ?? [],
      progress.revealedCandles ?? [],
    ),
  };
}

export function getTrainingProgressDisplay(
  chart: TrainingChartDto,
  progress: ProgressResponse | null,
) {
  const total = progress?.trainingBars ??
    (chart.bars === 300 ? 100 : chart.bars === 100 ? 40 : chart.bars);
  const analysis = progress?.analysisBars ?? Math.max(0, chart.bars - total);
  const rawProgress = progress?.progressIndex ?? chart.progressIndex;
  const calculated = Math.max(0, rawProgress - (analysis - 1));
  const current = progress?.trainingProgress ?? calculated;

  return {
    current: Math.max(0, Math.min(current, total)),
    total: Math.max(0, total),
  };
}

import type { HistogramData, LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";
import { toChartTime } from "./seriesData.ts";

function ema(values: number[], period: number): Array<number | null> {
  const k = 2 / (period + 1);
  const result: Array<number | null> = Array(values.length).fill(null);

  if (values.length < period) return result;

  let previous =
    values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result[period - 1] = previous;

  for (let i = period; i < values.length; i++) {
    previous = values[i] * k + previous * (1 - k);
    result[i] = previous;
  }

  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
  histogramUpColor = "rgba(34,197,94,0.45)",
  histogramDownColor = "rgba(239,68,68,0.45)",
): {
  macdLine: LineData[];
  signalLine: LineData[];
  histogram: HistogramData[];
} {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);
  const periodsAreValid =
    Number.isInteger(fastPeriod) &&
    Number.isInteger(slowPeriod) &&
    Number.isInteger(signalPeriod) &&
    fastPeriod > 0 &&
    slowPeriod > fastPeriod &&
    signalPeriod > 0;
  const firstOutputIndex = slowPeriod + signalPeriod - 2;

  if (!periodsAreValid || sorted.length <= firstOutputIndex) {
    return {
      macdLine: [],
      signalLine: [],
      histogram: [],
    };
  }

  const closes = sorted.map((c) => c.c);

  const fastEma = ema(closes, fastPeriod);
  const slowEma = ema(closes, slowPeriod);
  const macdStartIndex = slowPeriod - 1;
  const macdRaw = closes.slice(macdStartIndex).map((_, offset) => {
    const index = macdStartIndex + offset;
    return (fastEma[index] as number) - (slowEma[index] as number);
  });
  const signalRaw = ema(macdRaw, signalPeriod);

  const macdLine: LineData[] = [];
  const signalLine: LineData[] = [];
  const histogram: HistogramData[] = [];

  for (let offset = signalPeriod - 1; offset < macdRaw.length; offset++) {
    const candleIndex = macdStartIndex + offset;
    const macdValue = macdRaw[offset];
    const signalValue = signalRaw[offset] as number;
    const histogramValue = macdValue - signalValue;
    const time = toChartTime(sorted[candleIndex].t);

    macdLine.push({
      time,
      value: Number(macdValue.toFixed(2)),
    });

    signalLine.push({
      time,
      value: Number(signalValue.toFixed(2)),
    });

    histogram.push({
      time,
      value: Number(histogramValue.toFixed(2)),
      color: histogramValue >= 0 ? histogramUpColor : histogramDownColor,
    });
  }

  return {
    macdLine,
    signalLine,
    histogram,
  };
}

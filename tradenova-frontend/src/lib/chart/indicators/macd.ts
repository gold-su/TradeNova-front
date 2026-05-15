import type { HistogramData, LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];

  let prev = values[0];

  for (let i = 0; i < values.length; i++) {
    const current = values[i];
    prev = i === 0 ? current : current * k + prev * (1 - k);
    result.push(prev);
  }

  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): {
  macdLine: LineData[];
  signalLine: LineData[];
  histogram: HistogramData[];
} {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);

  if (sorted.length < slowPeriod + signalPeriod) {
    return {
      macdLine: [],
      signalLine: [],
      histogram: [],
    };
  }

  const closes = sorted.map((c) => c.c);

  const fastEma = ema(closes, fastPeriod);
  const slowEma = ema(closes, slowPeriod);

  const macdRaw = closes.map((_, i) => fastEma[i] - slowEma[i]);
  const signalRaw = ema(macdRaw, signalPeriod);
  const histRaw = macdRaw.map((v, i) => v - signalRaw[i]);

  const macdLine: LineData[] = [];
  const signalLine: LineData[] = [];
  const histogram: HistogramData[] = [];

  for (let i = slowPeriod - 1; i < sorted.length; i++) {
    const time = Math.floor(sorted[i].t / 1000);

    macdLine.push({
      time,
      value: Number(macdRaw[i].toFixed(2)),
    });

    signalLine.push({
      time,
      value: Number(signalRaw[i].toFixed(2)),
    });

    histogram.push({
      time,
      value: Number(histRaw[i].toFixed(2)),
      color: histRaw[i] >= 0 ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)",
    });
  }

  return {
    macdLine,
    signalLine,
    histogram,
  };
}

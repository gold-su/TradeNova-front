import type { LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";
import { toChartTime } from "./seriesData";

export function calculateBollinger(
  candles: Candle[],
  period: number,
  multiplier: number,
): {
  upper: LineData[];
  middle: LineData[];
  lower: LineData[];
} {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);

  const upper: LineData[] = [];
  const middle: LineData[] = [];
  const lower: LineData[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - period + 1, i + 1);

    const mean = window.reduce((sum, c) => sum + c.c, 0) / period;

    const variance =
      window.reduce((sum, c) => sum + (c.c - mean) ** 2, 0) / period;

    const std = Math.sqrt(variance);
    const time = toChartTime(sorted[i].t);

    upper.push({
      time,
      value: mean + std * multiplier,
    });

    middle.push({
      time,
      value: mean,
    });

    lower.push({
      time,
      value: mean - std * multiplier,
    });
  }

  return {
    upper,
    middle,
    lower,
  };
}

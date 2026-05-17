import type {
  CandlestickData,
  HistogramData,
  LineData,
} from "lightweight-charts";
import type { Candle, MaLineSetting } from "@/types/training";

export function toCandlestickData(candles: Candle[]): CandlestickData[] {
  return candles
    .map((x) => ({
      time: Math.floor(x.t / 1000),
      open: x.o,
      high: x.h,
      low: x.l,
      close: x.c,
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export function toVolumeData(candles: Candle[]): HistogramData[] {
  return candles
    .map((x) => ({
      time: Math.floor(x.t / 1000),
      value: x.v,
      color: x.c >= x.o ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)",
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export function toMovingAverageData(
  candles: Candle[],
  period: number,
): LineData[] {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);
  const result: LineData[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - period + 1, i + 1);
    const avg = window.reduce((sum, c) => sum + c.c, 0) / period;

    if (!Number.isFinite(avg)) continue;

    result.push({
      time: Math.floor(sorted[i].t / 1000),
      value: avg,
    });
  }

  return result;
}

export function normalizeMaLines(lines: MaLineSetting[]): MaLineSetting[] {
  const map = new Map<number, MaLineSetting>();

  lines.forEach((line) => {
    if (!Number.isFinite(line.period) || line.period <= 0) return;

    map.set(line.period, {
      period: line.period,
      color: line.color || "#facc15",
      width: line.width || 1,
    });
  });

  return Array.from(map.values()).sort((a, b) => a.period - b.period);
}

export function levelData(candles: Candle[], value: number): LineData[] {
  if (candles.length === 0) return [];
  if (!Number.isFinite(value)) return [];

  return candles
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((c) => ({
      time: Math.floor(c.t / 1000),
      value,
    }));
}

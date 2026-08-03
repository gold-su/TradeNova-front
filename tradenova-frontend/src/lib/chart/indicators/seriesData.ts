import type {
  CandlestickData,
  HistogramData,
  LineData,
  UTCTimestamp
} from "lightweight-charts";
import type { Candle, MaLineSetting } from "@/types/training";

export function toChartTime(epochMillis: number): UTCTimestamp {
  return Math.floor(epochMillis / 1000) as UTCTimestamp;
}

export function toCandlestickData(
  candles: Candle[],
): CandlestickData<UTCTimestamp>[] {
  return candles
    .map((x) => ({
      time: toChartTime(x.t),
      open: x.o,
      high: x.h,
      low: x.l,
      close: x.c,
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export function toVolumeData(
  candles: Candle[],
): HistogramData<UTCTimestamp>[] {
  return candles
    .map((x) => ({
      time: toChartTime(x.t),
      value: x.v,
      color: x.c >= x.o ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)",
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export function toMovingAverageData(
  candles: Candle[],
  period: number,
  type: "SMA" | "EMA" | "WMA" = "SMA",
): LineData<UTCTimestamp>[] {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);
  const result: LineData<UTCTimestamp>[] = [];

  if (type === "EMA") {
    const k = 2 / (period + 1);
    let ema: number | null = null;

    sorted.forEach((c, i) => {
      if (i < period - 1) return;

      if (ema === null) {
        const first = sorted.slice(i - period + 1, i + 1);
        ema = first.reduce((sum, x) => sum + x.c, 0) / period;
      } else {
        ema = c.c * k + ema * (1 - k);
      }

      result.push({
        time: toChartTime(c.t),
        value: ema,
      });
    });

    return result;
  }

  for (let i = period - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - period + 1, i + 1);

    const avg =
      type === "WMA"
        ? window.reduce((sum, c, idx) => sum + c.c * (idx + 1), 0) /
        ((period * (period + 1)) / 2)
        : window.reduce((sum, c) => sum + c.c, 0) / period;

    if (!Number.isFinite(avg)) continue;

    result.push({
      time: toChartTime(sorted[i].t),
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

export function levelData(
  candles: Candle[],
  value: number,
): LineData<UTCTimestamp>[] {
  if (candles.length === 0) return [];
  if (!Number.isFinite(value)) return [];

  return candles
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((c) => ({
      time: toChartTime(c.t),
      value,
    }));
}

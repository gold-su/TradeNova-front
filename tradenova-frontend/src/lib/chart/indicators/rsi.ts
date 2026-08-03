import type { LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";
import { toChartTime } from "./seriesData";
// RSI 값을 계산해서 lightweight-charts가 받을 수 있는 LineData[]로 바꿔주는 계산 함수.

export function calculateRSI(candles: Candle[], period = 14): LineData[] {
  if (candles.length < period + 1) return [];

  const sorted = candles.slice().sort((a, b) => a.t - b.t);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].c - sorted[i - 1].c;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const result: LineData[] = [];

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: toChartTime(sorted[i + 1].t),
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

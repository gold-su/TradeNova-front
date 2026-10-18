import type { LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";
import { toChartTime } from "./seriesData.ts";
// RSI 값을 계산해서 lightweight-charts가 받을 수 있는 LineData[]로 바꿔주는 계산 함수.

export function calculateRSI(candles: Candle[], period = 14): LineData[] {
  if (!Number.isInteger(period) || period <= 0) return [];
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

  const appendRsi = (candleIndex: number) => {
    let rsi: number;

    if (avgGain === 0 && avgLoss === 0) {
      rsi = 50;
    } else if (avgLoss === 0) {
      rsi = 100;
    } else if (avgGain === 0) {
      rsi = 0;
    } else {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }

    result.push({
      time: toChartTime(sorted[candleIndex].t),
      value: Number(rsi.toFixed(2)),
    });
  };

  // The initial average spans `period` changes, so it belongs to candle
  // index `period` and is already a valid first RSI value.
  appendRsi(period);

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    appendRsi(i + 1);
  }

  return result;
}

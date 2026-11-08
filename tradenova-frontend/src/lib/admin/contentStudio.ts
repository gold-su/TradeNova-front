import type { BlindContentCase, RevealedContentCase } from "@/api/contentStudioApi";
import type { Candle } from "@/types/training";

const SYNTHETIC_START = Date.UTC(2000, 0, 3);
const DAY_MS = 86_400_000;

export function toBlindChartCandles(contentCase: BlindContentCase): Candle[] {
  return contentCase.candles.map((candle) => ({
    ...candle,
    t: SYNTHETIC_START + candle.idx * DAY_MS,
  }));
}

export function toRevealedChartCandles(contentCase: RevealedContentCase): Candle[] {
  return contentCase.candles.map((candle) => ({
    ...candle,
    t: new Date(`${candle.date}T00:00:00Z`).getTime(),
  }));
}

export function nextVisibleIndex(contentCase: BlindContentCase, steps: 1 | 5) {
  const finalIndex = contentCase.analysisBars + contentCase.futureBars - 1;
  return Math.min(contentCase.visibleThroughIndex + steps, finalIndex);
}

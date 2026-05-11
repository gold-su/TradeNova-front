// RSI 전용 차트에 RSI 선 + 과매수 70선 + 과매도 30선을 그림.

import { LineSeries, type IChartApi, type LineData } from "lightweight-charts";
import type { Candle } from "@/types/training";
import { calculateRSI } from "@/lib/chart/indicators/rsi";

type Props = {
  chart: IChartApi;
  candles: Candle[];
  period?: number;
};

function levelData(candles: Candle[], value: number): LineData[] {
  if (candles.length === 0) return [];

  const sorted = candles.slice().sort((a, b) => a.t - b.t);

  return sorted.map((c) => ({
    time: Math.floor(c.t / 1000),
    value,
  }));
}

export function createRsiPane({ chart, candles, period = 14 }: Props) {
  const rsiSeries = chart.addSeries(LineSeries, {
    color: "#f97316",
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
    priceScaleId: "right",
  });

  const upperLine = chart.addSeries(LineSeries, {
    color: "rgba(239,68,68,0.45)",
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  });

  const lowerLine = chart.addSeries(LineSeries, {
    color: "rgba(34,197,94,0.45)",
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  });

  rsiSeries.setData(calculateRSI(candles, period));
  upperLine.setData(levelData(candles, 70));
  lowerLine.setData(levelData(candles, 30));

  chart.priceScale("right").applyOptions({
    autoScale: false,
    scaleMargins: {
      top: 0.1,
      bottom: 0.1,
    },
  });

  return {
    rsiSeries,
    upperLine,
    lowerLine,
  };
}

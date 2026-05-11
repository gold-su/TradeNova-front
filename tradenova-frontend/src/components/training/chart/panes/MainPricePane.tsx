// 차트의 메인 가격 영역 담당. 캔들 + 이동평균선을 그림
import {
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
} from "lightweight-charts";

import type {
  Candle,
  IndicatorSettings,
  MaLineSetting,
} from "@/types/training";

function toCandlestickData(candles: Candle[]): CandlestickData[] {
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

function toMovingAverageData(candles: Candle[], period: number): LineData[] {
  const sorted = candles.slice().sort((a, b) => a.t - b.t);

  const result: LineData[] = [];

  for (let i = period - 1; i < sorted.length; i++) {
    const window = sorted.slice(i - period + 1, i + 1);

    const avg = window.reduce((sum, c) => sum + c.c, 0) / period;

    result.push({
      time: Math.floor(sorted[i].t / 1000),
      value: avg,
    });
  }

  return result;
}

function normalizeMaLines(lines: MaLineSetting[]): MaLineSetting[] {
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

type Props = {
  chart: IChartApi;
  candles: Candle[];
  indicatorSettings: IndicatorSettings;
};

export function createMainPricePane({
  chart,
  candles,
  indicatorSettings,
}: Props) {
  const candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });

  candleSeries.setData(toCandlestickData(candles));

  const maLines = indicatorSettings.ma.enabled
    ? normalizeMaLines(indicatorSettings.ma.lines)
    : [];

  maLines.forEach((line) => {
    const maSeries = chart.addSeries(LineSeries, {
      color: line.color,
      lineWidth: line.width as 1 | 2 | 3 | 4,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    maSeries.setData(toMovingAverageData(candles, line.period));
  });

  return {
    candleSeries,
  };
}

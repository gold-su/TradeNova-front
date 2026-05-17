import {
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import type { MaLineSetting } from "@/types/training";

export type MainPriceSeriesRefs = {
  candleSeries: ISeriesApi<typeof CandlestickSeries>;
  maSeriesMap: Record<number, ISeriesApi<typeof LineSeries>>;
};

export function createMainPriceSeries(chart: IChartApi): MainPriceSeriesRefs {
  const candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });

  return {
    candleSeries,
    maSeriesMap: {},
  };
}

export function syncMaSeries({
  chart,
  maSeriesMap,
  lines,
}: {
  chart: IChartApi;
  maSeriesMap: Record<number, ISeriesApi<typeof LineSeries>>;
  lines: MaLineSetting[];
}) {
  const currentPeriods = new Set(lines.map((line) => line.period));

  Object.keys(maSeriesMap).forEach((key) => {
    const period = Number(key);

    if (!currentPeriods.has(period)) {
      chart.removeSeries(maSeriesMap[period]);
      delete maSeriesMap[period];
    }
  });

  lines.forEach((line) => {
    if (!maSeriesMap[line.period]) {
      maSeriesMap[line.period] = chart.addSeries(LineSeries, {
        color: line.color,
        lineWidth: line.width as 1 | 2 | 3 | 4,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    }

    maSeriesMap[line.period].applyOptions({
      color: line.color,
      lineWidth: line.width as 1 | 2 | 3 | 4,
    });
  });
}

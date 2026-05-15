import {
  HistogramSeries,
  LineSeries,
  type IChartApi,
} from "lightweight-charts";
import type { Candle } from "@/types/training";
import { calculateMACD } from "@/lib/chart/indicators/macd";

type Props = {
  chart: IChartApi;
  candles: Candle[];
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
};

export function createMacdPane({
  chart,
  candles,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
}: Props) {
  const { macdLine, signalLine, histogram } = calculateMACD(
    candles,
    fastPeriod,
    slowPeriod,
    signalPeriod,
  );

  const histogramSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: "price",
    },
    priceScaleId: "right",
    lastValueVisible: false,
    priceLineVisible: false,
  });

  const macdSeries = chart.addSeries(LineSeries, {
    color: "#f97316",
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
  });

  const signalSeries = chart.addSeries(LineSeries, {
    color: "#38bdf8",
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
  });

  histogramSeries.setData(histogram);
  macdSeries.setData(macdLine);
  signalSeries.setData(signalLine);

  chart.priceScale("right").applyOptions({
    autoScale: true,
    scaleMargins: {
      top: 0.15,
      bottom: 0.15,
    },
  });

  return {
    histogramSeries,
    macdSeries,
    signalSeries,
  };
}

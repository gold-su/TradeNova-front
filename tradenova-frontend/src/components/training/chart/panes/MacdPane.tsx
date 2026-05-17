import {
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

export type MacdSeriesRefs = {
  histogramSeries: ISeriesApi<typeof HistogramSeries>;
  macdSeries: ISeriesApi<typeof LineSeries>;
  signalSeries: ISeriesApi<typeof LineSeries>;
};

export function createMacdSeries(chart: IChartApi): MacdSeriesRefs {
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

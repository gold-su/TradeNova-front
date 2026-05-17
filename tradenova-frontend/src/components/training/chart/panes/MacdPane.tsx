import {
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

type Props = {
  chart: IChartApi;
  macdColor?: string;
  signalColor?: string;
};

export type MacdSeriesRefs = {
  histogramSeries: ISeriesApi<typeof HistogramSeries>;
  macdSeries: ISeriesApi<typeof LineSeries>;
  signalSeries: ISeriesApi<typeof LineSeries>;
};

export function createMacdSeries({
  chart,
  macdColor = "#f97316",
  signalColor = "#38bdf8",
}: Props): MacdSeriesRefs {
  const histogramSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: "price",
    },
    priceScaleId: "right",
    lastValueVisible: false,
    priceLineVisible: false,
  });

  const macdSeries = chart.addSeries(LineSeries, {
    color: macdColor,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
  });

  const signalSeries = chart.addSeries(LineSeries, {
    color: signalColor,
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

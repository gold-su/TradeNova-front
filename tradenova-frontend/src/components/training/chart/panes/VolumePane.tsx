import {
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

export type VolumeSeriesRefs = {
  volumeSeries: ISeriesApi<"Histogram">;
};

export function createVolumeSeries(chart: IChartApi): VolumeSeriesRefs {
  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: {
      type: "volume",
    },
    priceScaleId: "volume",
    lastValueVisible: false,
    priceLineVisible: false,
  });

  chart.priceScale("volume").applyOptions({
    scaleMargins: {
      top: 0.78,
      bottom: 0,
    },
  });

  return {
    volumeSeries,
  };
}

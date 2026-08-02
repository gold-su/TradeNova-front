import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

type Props = {
  chart: IChartApi;
  rsiColor?: string;
  upperColor?: string;
  lowerColor?: string;
};

export type RsiSeriesRefs = {
  rsiSeries: ISeriesApi<"Line">;
  upperLine: ISeriesApi<"Line">;
  lowerLine: ISeriesApi<"Line">;
};

export function createRsiSeries({
  chart,
  rsiColor = "#f97316",
  upperColor = "rgba(239,68,68,0.45)",
  lowerColor = "rgba(34,197,94,0.45)",
}: Props): RsiSeriesRefs {
  const rsiSeries = chart.addSeries(LineSeries, {
    color: rsiColor,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: true,
    priceScaleId: "right",
  });

  const upperLine = chart.addSeries(LineSeries, {
    color: upperColor,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  });

  const lowerLine = chart.addSeries(LineSeries, {
    color: lowerColor,
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
  });

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

// 메인 차트 아래쪽에 붙는 거래량 히스토그램 담당. Candle.v 갓ㅂ을 막대로 그림.
import {
  HistogramSeries,
  type IChartApi,
  type HistogramData,
} from "lightweight-charts";

import type { Candle } from "@/types/training";

function toVolumeData(candles: Candle[]): HistogramData[] {
  return candles
    .map((x) => ({
      time: Math.floor(x.t / 1000),
      value: x.v,
      color: x.c >= x.o ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)",
    }))
    .sort((a, b) => Number(a.time) - Number(b.time));
}

type Props = {
  chart: IChartApi;
  candles: Candle[];
};

export function createVolumePane({ chart, candles }: Props) {
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

  volumeSeries.setData(toVolumeData(candles));

  return {
    volumeSeries,
  };
}

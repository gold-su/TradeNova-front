import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import { TrainingChartTile } from "./TrainingChartTile";
import type { IndicatorSettings } from "@/types/training";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";

type Props = {
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  candlesByChart: Record<number, Candle[]>;
  progressByChart: Record<number, ProgressResponse>;
  onOpenSingle: () => void;
  onRefreshChart: (chartId: number) => void;
  refreshing: boolean;
  globalIndicators: IndicatorSettings;
  chartIndicators: Record<number, IndicatorSettings>;
  tradeMarkersByChart: Record<number, TradeChartMarker[]>;
};

export function TrainingChartGrid({
  charts,
  activeChartId,
  setActiveChartId,
  candlesByChart,
  progressByChart,
  onOpenSingle,
  onRefreshChart,
  refreshing,
  globalIndicators,
  chartIndicators,
  tradeMarkersByChart = {},
}: Props) {
  return (
    <div className="thin-scrollbar h-full overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3 pb-6">
        {charts.map((c) => (
          <TrainingChartTile
            key={c.chartId}
            chart={c}
            active={activeChartId === c.chartId}
            candles={candlesByChart[c.chartId] ?? []}
            progress={progressByChart[c.chartId] ?? null}
            onClick={() => {
              setActiveChartId(c.chartId);
            }}
            onDoubleClick={() => {
              setActiveChartId(c.chartId);
              onOpenSingle();
            }}
            onRefresh={onRefreshChart}
            refreshing={refreshing}
            indicatorSettings={chartIndicators[c.chartId] ?? globalIndicators}
            hasIndicatorOverride={!!chartIndicators[c.chartId]}
            tradeMarkers={tradeMarkersByChart[c.chartId] ?? []}
          />
        ))}
      </div>
    </div>
  );
}

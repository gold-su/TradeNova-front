import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import { TrainingChartTile } from "./TrainingChartTile";
import type { IndicatorSettings } from "@/types/training";

type Props = {
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  candlesByChart: Record<number, Candle[]>;
  progressByChart: Record<number, ProgressResponse>;
  onOpenSingle: () => void;
  onRefreshChart: (chartId: number) => void;
  refreshing: boolean;
  indicatorSettings: IndicatorSettings;
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
  indicatorSettings,
}: Props) {
  return (
    <div className="grid h-full grid-cols-2 gap-4">
      {charts.map((c) => (
        <TrainingChartTile
          key={c.chartId}
          chart={c}
          active={activeChartId === c.chartId}
          candles={candlesByChart[c.chartId] ?? []}
          progress={progressByChart[c.chartId] ?? null}
          onClick={() => {
            setActiveChartId(c.chartId);
            onOpenSingle();
          }}
          onRefresh={onRefreshChart}
          refreshing={refreshing}
          indicatorSettings={indicatorSettings}
        />
      ))}
    </div>
  );
}

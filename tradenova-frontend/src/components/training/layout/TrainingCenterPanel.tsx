import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import type { ViewMode } from "@/pages/training/useTrainingSessionPage";
import { TrainingChartGrid } from "@/components/training/chart/TrainingChartGrid";
import { TrainingChartSingle } from "@/components/training/chart/TrainingChartSingle";

type Props = {
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  candlesByChart: Record<number, Candle[]>;
  progressByChart: Record<number, ProgressResponse>;
  activeChart: TrainingChartDto | null;
  activeProgress: ProgressResponse | null;
  visibleActiveCandles: Candle[];
  error: string | null;
  onRefreshChart: (chartId: number) => void;
  refreshing: boolean;
};

export function TrainingCenterPanel({
  charts,
  activeChartId,
  setActiveChartId,
  viewMode,
  setViewMode,
  candlesByChart,
  progressByChart,
  activeChart,
  activeProgress,
  visibleActiveCandles,
  onRefreshChart,
  error,
  refreshing,
}: Props) {
  return (
    <main className="flex-1 overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Active Chart</div>
          <div className="text-lg font-semibold">
            {activeChart
              ? `${activeChart.symbolTicker} · ${activeChart.symbolName}`
              : "차트를 선택해줘"}
          </div>
        </div>

        {viewMode === "single" && (
          <button
            type="button"
            disabled={refreshing}
            onClick={() => setViewMode("grid")}
            className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
          >
            Grid로 보기
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="h-[calc(100%-64px)]">
        {viewMode === "grid" ? (
          <TrainingChartGrid
            charts={charts}
            activeChartId={activeChartId}
            setActiveChartId={setActiveChartId}
            candlesByChart={candlesByChart}
            progressByChart={progressByChart}
            onOpenSingle={() => setViewMode("single")}
            onRefreshChart={onRefreshChart}
            refreshing={refreshing}
          />
        ) : (
          <TrainingChartSingle
            chart={activeChart}
            progress={activeProgress}
            candles={visibleActiveCandles}
            onRefresh={onRefreshChart}
            refreshing={refreshing}
          />
        )}
      </div>
    </main>
  );
}

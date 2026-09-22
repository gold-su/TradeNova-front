import type { Dispatch, SetStateAction } from "react";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import { TrainingChartTile } from "./TrainingChartTile";
import type { IndicatorSettings } from "@/types/training";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";
import type { ChartDrawing, DrawingPoint, DrawingTool, PendingDrawing, SelectedDrawing } from "./drawing/drawingTypes";

type Props = {
  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;
  candlesByChart: Record<number, Candle[]>;
  progressByChart: Record<number, ProgressResponse>;
  onOpenSingle: () => void;
  onRefreshChart: (chartId: number) => void;
  refreshingChartIds: Set<number>;
  globalIndicators: IndicatorSettings;
  chartIndicators: Record<number, IndicatorSettings>;
  tradeMarkersByChart: Record<number, TradeChartMarker[]>;
  drawingsByChart: Record<number, ChartDrawing[]>;
  drawingTool: DrawingTool;
  pendingDrawing: PendingDrawing;
  selectedDrawing: SelectedDrawing;
  onAddDrawingPoint: (chartId: number, point: DrawingPoint) => void;
  onSelectDrawing: (selection: SelectedDrawing) => void;
};

export function TrainingChartGrid({
  charts,
  activeChartId,
  setActiveChartId,
  candlesByChart,
  progressByChart,
  onOpenSingle,
  onRefreshChart,
  refreshingChartIds,
  globalIndicators,
  chartIndicators,
  tradeMarkersByChart = {},
  drawingsByChart,
  drawingTool,
  pendingDrawing,
  selectedDrawing,
  onAddDrawingPoint,
  onSelectDrawing,
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
            refreshing={refreshingChartIds.has(c.chartId)}
            indicatorSettings={chartIndicators[c.chartId] ?? globalIndicators}
            hasIndicatorOverride={!!chartIndicators[c.chartId]}
            tradeMarkers={tradeMarkersByChart[c.chartId] ?? []}
            drawings={drawingsByChart[c.chartId] ?? []}
            drawingTool={drawingTool}
            pendingDrawing={pendingDrawing}
            selectedDrawing={selectedDrawing}
            onAddDrawingPoint={onAddDrawingPoint}
            onSelectDrawing={onSelectDrawing}
          />
        ))}
      </div>
    </div>
  );
}

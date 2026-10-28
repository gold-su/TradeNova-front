import CandleChart, {
  type TradeChartMarker,
} from "@/components/training/chart/CandleChart";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import type { IndicatorSettings } from "@/types/training";
import { RefreshCw } from "lucide-react";
import { getTrainingProgressDisplay } from "@/hooks/training/trainingCandleReveal";
import type { ChartDrawing, DrawingPoint, DrawingTool, PendingDrawing, SelectedDrawing } from "./drawing/drawingTypes";
import { getTrainingChartTileState, hasOpenChartPosition } from "./trainingChartTileState";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  chart: TrainingChartDto;
  active: boolean;
  candles: Candle[];
  progress: ProgressResponse | null;
  onClick: () => void;
  onDoubleClick: () => void;
  onRefresh: (chartId: number) => void;
  refreshing: boolean;
  indicatorSettings: IndicatorSettings;
  hasIndicatorOverride?: boolean;
  tradeMarkers?: TradeChartMarker[];
  drawings?: ChartDrawing[];
  drawingTool?: DrawingTool;
  pendingDrawing?: PendingDrawing;
  selectedDrawing?: SelectedDrawing;
  onAddDrawingPoint?: (chartId: number, point: DrawingPoint) => void;
  onCommitDrawingText?: (value: string) => boolean;
  onCancelDrawingDraft?: () => void;
  onSelectDrawing?: (selection: SelectedDrawing) => void;
  showDrawingToolbar?: boolean;
  onSelectDrawingTool?: (tool: DrawingTool) => void;
  onDeleteSelectedDrawing?: () => void;
  canDeleteDrawing?: boolean;
  onClearDrawings?: () => void;
  canClearDrawings?: boolean;
  drawingEditingEnabled?: boolean;
};

export function TrainingChartTile({
  chart,
  active,
  candles,
  progress,
  onClick,
  onDoubleClick,
  onRefresh,
  refreshing,
  indicatorSettings,
  hasIndicatorOverride,
  tradeMarkers = [],
  drawings = [],
  drawingTool,
  pendingDrawing,
  selectedDrawing,
  onAddDrawingPoint,
  onCommitDrawingText,
  onCancelDrawingDraft,
  onSelectDrawing,
  showDrawingToolbar,
  onSelectDrawingTool,
  onDeleteSelectedDrawing,
  canDeleteDrawing,
  onClearDrawings,
  canClearDrawings,
  drawingEditingEnabled = false,
}: Props) {
  const { t } = useI18n();
  const sectorLabel = (sector?: string) => t(`training.sector.${sector && ["SEMICONDUCTOR", "SECONDARY_BATTERY", "PLATFORM", "BIO", "FINANCE", "DEFENSE", "SHIPBUILDING"].includes(sector) ? sector : "unknown"}`);
  const visible = progress
    ? candles.slice(0, Math.min(progress.progressIndex + 1, candles.length))
    : candles;

  const { current, total } = getTrainingProgressDisplay(chart, progress);
  const tileState = getTrainingChartTileState(active, chart, progress);
  const hasPosition = hasOpenChartPosition(chart, progress);

  const chartHeight = 245;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={[
        "group relative flex min-h-0 cursor-pointer flex-col rounded-xl border bg-background/10 p-2.5 text-left shadow-sm transition-all duration-150",
        tileState === "selected"
          ? "border-primary/60 bg-background/10 shadow-[0_0_0_1px_rgba(52,211,153,0.18),0_10px_24px_rgba(0,0,0,0.2)]"
          : tileState === "holding"
            ? "border-cyan-400/35 bg-cyan-400/[0.025] hover:border-cyan-300/50 hover:bg-cyan-400/[0.04]"
            : "border-border/40 hover:border-border/80 hover:bg-background/20 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
      ].join(" ")}
    >
      <div className="mb-2 flex h-8 items-center justify-between gap-2 border-b border-border/35 pb-2">
        <div className="min-w-0 flex items-center gap-1.5">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            Chart {chart.chartIndex + 1}
          </span>

          <span className="text-[11px] text-muted-foreground">·</span>

          <span className="truncate text-xs font-semibold text-foreground">
            {sectorLabel(chart.trainingSector)}
          </span>

          {hasIndicatorOverride && (
            <span className="shrink-0 rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {t("training.chartUi.indicators")}
            </span>
          )}

          {hasPosition && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-cyan-300/25 bg-cyan-300/[0.07] px-1.5 py-0.5 text-[10px] font-medium text-cyan-200">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan-300" />
              {t("training.chart.holding")}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[11px] font-medium text-foreground">
            {current}
            <span className="text-muted-foreground">/{total}</span>
          </span>

          <button
            type="button"
            disabled={refreshing}
            title={t("training.chart.refresh")}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRefresh(chart.chartId);
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/40 bg-background/30 text-muted-foreground transition hover:border-border hover:bg-background/60 hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "h-3.5 w-3.5",
                refreshing ? "animate-spin text-primary" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1" style={{ height: chartHeight }}>
        {visible.length > 0 ? (
          <>
            <CandleChart
              chartId={chart.chartId}
              candles={visible}
              height={chartHeight}
              indicatorSettings={indicatorSettings}
              indicatorDisplayMode="COMPACT"
              tradeMarkers={tradeMarkers}
              drawings={drawings}
              drawingTool={drawingTool}
              pendingDrawing={pendingDrawing}
              selectedDrawing={selectedDrawing}
              onAddDrawingPoint={onAddDrawingPoint}
              onCommitDrawingText={onCommitDrawingText}
              onCancelDrawingDraft={onCancelDrawingDraft}
              onSelectDrawing={onSelectDrawing}
              showDrawingToolbar={showDrawingToolbar}
              onSelectDrawingTool={onSelectDrawingTool}
              onDeleteSelectedDrawing={onDeleteSelectedDrawing}
              canDeleteDrawing={canDeleteDrawing}
              onClearDrawings={onClearDrawings}
              canClearDrawings={canClearDrawings}
              drawingEditingEnabled={drawingEditingEnabled}
            />
            <div
              key={`${chart.chartId}-${visible.length}`}
              aria-hidden="true"
              className="candle-append-pulse pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-primary/20"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-border/50 bg-background/20 text-xs text-muted-foreground">
            {t("training.chartUi.noData")}
          </div>
        )}
      </div>
    </div>
  );
}

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

function sectorLabel(sector?: string) {
  switch (sector) {
    case "SEMICONDUCTOR":
      return "반도체";
    case "SECONDARY_BATTERY":
      return "2차전지";
    case "PLATFORM":
      return "플랫폼";
    case "BIO":
      return "바이오";
    case "FINANCE":
      return "금융";
    case "DEFENSE":
      return "방산";
    case "SHIPBUILDING":
      return "조선";
    default:
      return "블라인드";
  }
}

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
}: Props) {
  const visible = progress
    ? candles.slice(0, Math.min(progress.progressIndex + 1, candles.length))
    : candles;

  const current = progress?.progressIndex ?? chart.progressIndex ?? 0;
  const total = Math.max(chart.bars - 1, 1);

  const subPaneCount =
    Number(indicatorSettings.rsi.enabled) +
    Number(indicatorSettings.macd.enabled);

  const chartHeight = subPaneCount > 0 ? 250 + subPaneCount * 86 : 245;

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
        active
          ? "border-primary/45 bg-primary/[0.035] shadow-[0_0_0_1px_rgba(52,211,153,0.12),0_12px_30px_rgba(0,0,0,0.22)]"
          : "border-border/40 hover:border-border/80 hover:bg-background/20 hover:shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
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
              지표
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
            title="차트 새로고침"
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

      <div className="min-h-0 flex-1" style={{ height: chartHeight }}>
        {visible.length > 0 ? (
          <CandleChart
            candles={visible}
            height={chartHeight}
            indicatorSettings={indicatorSettings}
            tradeMarkers={tradeMarkers}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-border/50 bg-background/20 text-xs text-muted-foreground">
            no data
          </div>
        )}
      </div>
    </div>
  );
}
import CandleChart from "@/components/training/chart/CandleChart";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";
import type { IndicatorSettings } from "@/types/training";

function n(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("ko-KR").format(v);
}

function n2(v: number | null | undefined) {
  if (v === null || v === undefined) return "-";
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(v);
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
}: Props) {
  const visible = progress
    ? candles.slice(0, Math.min(progress.progressIndex + 1, candles.length))
    : candles;

  const subPaneCount =
    Number(indicatorSettings.rsi.enabled) +
    Number(indicatorSettings.macd.enabled);

  const chartHeight = subPaneCount > 0 ? 320 + subPaneCount * 110 : 260;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
      className={[
        "group relative flex min-h-0 cursor-pointer flex-col rounded-2xl border border-border/40 bg-background/10 p-3 text-left",
        active ? "ring-1 ring-primary/40" : "hover:border-border/80",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-muted-foreground">
            Chart {chart.chartIndex + 1}
          </div>
          <div className="text-sm font-semibold">
            {chart.symbolTicker}{" "}
            <span className="text-muted-foreground">· {chart.symbolName}</span>
            {hasIndicatorOverride && (
              <span className="ml-2 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary">
                개별 지표 적용됨
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 새로고침 버튼 */}
          <button
            type="button"
            disabled={refreshing}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRefresh(chart.chartId);
            }}
            className="rounded-lg border border-border/60 px-2 py-1 text-[11px] hover:bg-background/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "..." : "↻"}
          </button>

          <div className="text-right text-xs text-muted-foreground">
            <div>idx: {progress?.progressIndex ?? "-"}</div>
            <div>
              px:{" "}
              <span className="text-foreground">
                {n2(progress?.currentPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1" style={{ height: chartHeight }}>
        {visible.length > 0 ? (
          <CandleChart
            candles={visible}
            height={chartHeight}
            indicatorSettings={indicatorSettings}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-background/20 text-xs text-muted-foreground">
            no data
          </div>
        )}
      </div>
    </div>
  );
}

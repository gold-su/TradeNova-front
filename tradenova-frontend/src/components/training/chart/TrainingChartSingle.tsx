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
  chart: TrainingChartDto | null;
  progress: ProgressResponse | null;
  candles: Candle[];
  onRefresh: (chartId: number) => void;
  refreshing: boolean;
  indicatorSettings: IndicatorSettings;
  tradeMarkers?: TradeChartMarker[];
};

export function TrainingChartSingle({
  chart,
  progress,
  candles,
  onRefresh,
  refreshing,
  indicatorSettings,
  tradeMarkers = [],
}: Props) {
  if (!chart) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-background/20 text-sm text-muted-foreground">
        차트를 선택하세요.
      </div>
    );
  }

  const { current, total } = getTrainingProgressDisplay(chart, progress);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/50 bg-background/15 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex h-9 items-center justify-between border-b border-border/35 pb-2">
        <div className="min-w-0 flex items-center gap-2 truncate">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground">
            Chart {chart.chartIndex + 1}
          </span>

          <span className="text-xs text-muted-foreground">·</span>

          <span className="text-sm font-semibold text-foreground">
            {sectorLabel(chart.trainingSector)}
          </span>

          <span className="text-xs text-muted-foreground">·</span>

          <span className="text-xs font-medium text-foreground">
            {current}
            <span className="text-muted-foreground">/{total}</span>
          </span>
        </div>

        <button
          type="button"
          disabled={refreshing}
          title="차트 새로고침"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRefresh(chart.chartId);
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/40 bg-background/30 text-muted-foreground transition hover:border-border hover:bg-background/60 hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              refreshing ? "animate-spin text-primary" : "",
            ].join(" ")}
          />
        </button>
      </div>

      <div className="min-h-0 flex-1">
        {candles.length > 0 ? (
          <CandleChart
            chartId={chart.chartId}
            candles={candles}
            height={520}
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

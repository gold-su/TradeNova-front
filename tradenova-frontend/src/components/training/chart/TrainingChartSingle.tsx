import CandleChart from "@/components/training/chart/CandleChart";
import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
} from "@/types/training";

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
  chart: TrainingChartDto | null;
  progress: ProgressResponse | null;
  candles: Candle[];
};

export function TrainingChartSingle({ chart, progress, candles }: Props) {
  if (!chart) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border/60 bg-background/20 text-sm text-muted-foreground">
        차트를 선택해줘
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-background/20 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">
            Chart {chart.chartIndex + 1}
          </div>
          <div className="text-lg font-semibold">
            {chart.symbolTicker}{" "}
            <span className="text-muted-foreground">· {chart.symbolName}</span>
          </div>
        </div>

        <div className="text-right text-sm">
          <div>idx: {progress?.progressIndex ?? "-"}</div>
          <div>px: {n2(progress?.currentPrice)}</div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {candles.length > 0 ? (
          <CandleChart candles={candles} height={520} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-background/20 text-xs text-muted-foreground">
            no data
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Cash</div>
          <div className="font-semibold">{n(progress?.cashBalance)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Qty</div>
          <div className="font-semibold">{n2(progress?.positionQty)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Avg</div>
          <div className="font-semibold">{n2(progress?.avgPrice)}</div>
        </div>
      </div>
    </div>
  );
}

import type { ProgressResponse, TrainingChartDto } from "@/types/training";

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
};

export function AccountSnapshotCard({ chart, progress }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Account Snapshot</div>

      <div className="mb-3 text-xs text-muted-foreground">
        {chart
          ? `${chart.symbolTicker} · ${chart.symbolName}`
          : "선택된 차트 없음"}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Current Price</div>
          <div className="font-semibold">{n2(progress?.currentPrice)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Cash</div>
          <div className="font-semibold">{n(progress?.cashBalance)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Position Qty</div>
          <div className="font-semibold">{n2(progress?.positionQty)}</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/20 p-3">
          <div className="text-muted-foreground">Avg Price</div>
          <div className="font-semibold">{n2(progress?.avgPrice)}</div>
        </div>
      </div>
    </div>
  );
}

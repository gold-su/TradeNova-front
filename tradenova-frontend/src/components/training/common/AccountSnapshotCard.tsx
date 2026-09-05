import type { ProgressResponse, TrainingChartDto } from "@/types/training";
import { Wallet } from "lucide-react";
import { calculateUnrealizedPosition } from "./accountSnapshotCalculations";

function isFiniteNumber(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function n(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "-";
  return new Intl.NumberFormat("ko-KR").format(v);
}

function n2(v: number | null | undefined) {
  if (!isFiniteNumber(v)) return "-";
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(v);
}

function signed(v: number | null, suffix: string) {
  if (v === null) return "-";
  const value = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(v);
  return `${v > 0 ? "+" : ""}${value}${suffix}`;
}

function pnlTone(v: number | null) {
  if (v === null || v === 0) return "text-foreground";
  return v > 0 ? "text-green-400" : "text-red-400";
}

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
};

export function AccountSnapshotCard({ chart, progress }: Props) {
  const cash = progress?.cashBalance ?? null;
  const qty = progress?.positionQty ?? null;
  const avg = progress?.avgPrice ?? null;
  const current = progress?.currentPrice ?? null;

  const hasPosition = !!qty && qty > 0;
  const { unrealizedPnL, returnRate } = calculateUnrealizedPosition(
    current,
    avg,
    qty,
  );

  return (
    <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-sm font-semibold">계좌/포지션</div>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {chart
            ? `Chart ${chart.chartIndex + 1} · ${sectorLabel(chart.trainingSector)}`
            : "차트 없음"}
        </div>
      </div>

      <div className="rounded-lg border border-border/35 bg-background/25 px-3 py-2">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground">현재가</div>
            <div className="mt-0.5 text-lg font-bold leading-none text-primary">
              {isFiniteNumber(current) ? `${n2(current)}원` : "-"}
            </div>
          </div>

          <div className="text-right text-[11px] text-muted-foreground">
            {hasPosition ? "보유 중" : "미보유"}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground">현금</div>
            <div className="mt-0.5 truncate text-xs font-semibold">
              {isFiniteNumber(cash) ? `${n(cash)}원` : "-"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground">보유</div>
            <div className="mt-0.5 text-xs font-semibold">
              {isFiniteNumber(qty) ? `${n2(qty)}주` : "-"}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground">평단</div>
            <div className="mt-0.5 truncate text-xs font-semibold">
              {isFiniteNumber(avg) ? `${n2(avg)}원` : "-"}
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/30 pt-2">
          <div>
            <div className="text-[10px] text-muted-foreground">평가손익</div>
            <div
              className={`mt-0.5 truncate text-xs font-semibold ${pnlTone(unrealizedPnL)}`}
            >
              {signed(unrealizedPnL, "원")}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">수익률</div>
            <div
              className={`mt-0.5 text-xs font-semibold ${pnlTone(returnRate)}`}
            >
              {signed(returnRate, "%")}
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/30 pt-2">
          <div>
            <div className="text-[10px] text-muted-foreground">평가손익</div>
            <div className={`mt-0.5 truncate text-xs font-semibold ${pnlTone(unrealizedPnl)}`}>
              {signed(unrealizedPnl, "원")}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">수익률</div>
            <div className={`mt-0.5 text-xs font-semibold ${pnlTone(returnRate)}`}>
              {signed(returnRate, "%")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

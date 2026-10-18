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
  const { marketValue, unrealizedPnL, returnRate } = calculateUnrealizedPosition(
    current,
    avg,
    qty,
  );

  return (
    <section className="rounded-xl border border-border/45 bg-muted/[0.07] p-3.5">
      <div className="flex items-center justify-between gap-3">
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

      <div className="mt-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground">현재가</div>
            <div className="mt-1 text-xl font-bold leading-none text-primary">
              {isFiniteNumber(current) ? `${n2(current)}원` : "-"}
            </div>
          </div>

          <div className="rounded-full border border-border/45 bg-background/35 px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
            {hasPosition ? "포지션 보유" : "미보유"}
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/30 pt-3">
          <Metric label="사용 가능 현금" value={isFiniteNumber(cash) ? `${n(cash)}원` : "-"} />
          <Metric label="평가 금액" value={marketValue === null ? "-" : `${n(marketValue)}원`} align="right" />
          <Metric label="보유 수량" value={isFiniteNumber(qty) ? `${n2(qty)}주` : "-"} />
          <Metric label="평균 매입가" value={isFiniteNumber(avg) && hasPosition ? `${n2(avg)}원` : "-"} align="right" />
          <Metric label="평가 손익" value={signed(unrealizedPnL, "원")} tone={pnlTone(unrealizedPnL)} />
          <Metric label="수익률" value={signed(returnRate, "%")} tone={pnlTone(returnRate)} align="right" />
        </dl>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone = "text-foreground",
  align = "left",
}: {
  label: string;
  value: string;
  tone?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0"}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={`mt-1 truncate text-sm font-semibold tabular-nums ${tone}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

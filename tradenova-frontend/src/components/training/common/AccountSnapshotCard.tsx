import type { ProgressResponse, TrainingChartDto } from "@/types/training";
import { Wallet } from "lucide-react";
import { calculateUnrealizedPosition } from "./accountSnapshotCalculations";
import { useI18n } from "@/i18n/LanguageProvider";

function isFiniteNumber(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function n(v: number | null | undefined, locale: string) {
  if (!isFiniteNumber(v)) return "-";
  return new Intl.NumberFormat(locale).format(v);
}

function n2(v: number | null | undefined, locale: string) {
  if (!isFiniteNumber(v)) return "-";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(v);
}

function signed(v: number | null, suffix: string, locale: string) {
  if (v === null) return "-";
  const value = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(v);
  return `${v > 0 ? "+" : ""}${value}${suffix}`;
}

function pnlTone(v: number | null) {
  if (v === null || v === 0) return "text-foreground";
  return v > 0 ? "text-green-400" : "text-red-400";
}

type Props = {
  chart: TrainingChartDto | null;
  progress: ProgressResponse | null;
};

export function AccountSnapshotCard({ chart, progress }: Props) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const sectorKey = chart?.trainingSector && ["SEMICONDUCTOR", "SECONDARY_BATTERY", "PLATFORM", "BIO", "FINANCE", "DEFENSE", "SHIPBUILDING"].includes(chart.trainingSector) ? chart.trainingSector : "unknown";
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
          <div className="text-sm font-semibold">{t("training.account.snapshot")}</div>
        </div>

        <div className="text-[11px] text-muted-foreground">
          {chart
            ? `Chart ${chart.chartIndex + 1} · ${t(`training.sector.${sectorKey}`)}`
            : t("training.chart.none")}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground">{t("training.account.currentPrice")}</div>
            <div className="mt-1 text-xl font-bold leading-none text-primary">
              {isFiniteNumber(current) ? `₩${n2(current, locale)}` : "-"}
            </div>
          </div>

          <div className="rounded-full border border-border/45 bg-background/35 px-2 py-1 text-right text-[11px] font-medium text-muted-foreground">
            {hasPosition ? t("training.account.hasPosition") : t("training.account.noPosition")}
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/30 pt-3">
          <Metric label={t("training.account.availableCash")} value={isFiniteNumber(cash) ? `₩${n(cash, locale)}` : "-"} />
          <Metric label={t("training.account.marketValue")} value={marketValue === null ? "-" : `₩${n(marketValue, locale)}`} align="right" />
          <Metric label={t("training.account.positionQty")} value={isFiniteNumber(qty) ? t("training.chart.shares", { count: n2(qty, locale) }) : "-"} />
          <Metric label={t("training.account.averagePrice")} value={isFiniteNumber(avg) && hasPosition ? `₩${n2(avg, locale)}` : "-"} align="right" />
          <Metric label={t("training.account.unrealizedPnl")} value={signed(unrealizedPnL, " KRW", locale)} tone={pnlTone(unrealizedPnL)} />
          <Metric label={t("training.account.returnRate")} value={signed(returnRate, "%", locale)} tone={pnlTone(returnRate)} align="right" />
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

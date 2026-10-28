import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BrainCircuit, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGrowthAnalytics } from "@/hooks/useGrowthAnalytics";
import type { GrowthMetricResponse, GrowthPeriod, GrowthTrendPointResponse } from "@/types/training";
import { buildScoreChart, scorePolyline } from "./growthChart";
import { splitGrowthOverview } from "./growthView";
import { formatProcessScore, formatTrendTooltip, getLevelProgress } from "./growthPresentation";
import { useI18n } from "@/i18n/LanguageProvider";

export default function GrowthAnalyticsPage() {
  const { t } = useI18n();
  const [period, setPeriod] = useState<GrowthPeriod>("LAST_10");
  const growth = useGrowthAnalytics(period);
  const periodLabels: Record<GrowthPeriod, string> = { LAST_10: t("growth.last10"), LAST_30: t("growth.last30"), ALL: t("growth.all") };
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-border/45 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold tracking-[0.16em] text-primary">GROWTH</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">{t("growth.title")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("growth.description")}</p></div>
        <div><p className="mb-1.5 text-[11px] text-muted-foreground">{t("growth.periodHelp")}</p><Select value={period} onValueChange={(value) => setPeriod(value as GrowthPeriod)}><SelectTrigger className="w-full sm:w-36" aria-label={t("growth.periodLabel")}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(periodLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
      </header>

      {growth.loading && <GrowthSkeleton />}
      {growth.error && <StateMessage title={t("growth.loadFailed")} action={<Button size="sm" variant="outline" onClick={() => void growth.load()}>{t("common.retry")}</Button>} />}
      {!growth.loading && !growth.error && growth.data && growth.data.period.completedSessions === 0 && <StateMessage title={t("growth.needMore")} description={t("growth.firstComplete")} action={<Button asChild size="sm"><Link to="/training">{t("training.completion.newSession")}</Link></Button>} />}
      {!growth.loading && !growth.error && growth.data && growth.data.period.completedSessions > 0 && <GrowthDashboard data={growth.data} />}
    </main>
  );
}

function GrowthDashboard({ data }: { data: NonNullable<ReturnType<typeof useGrowthAnalytics>["data"]> }) {
  const { language, t } = useI18n();
  const { lifetime, period } = splitGrowthOverview(data);
  const levelProgress = getLevelProgress(lifetime.currentLevelXp, lifetime.nextLevelXp);
  return <div className="mt-7 space-y-9">
    <section className="grid gap-6 rounded-xl border border-border/55 bg-muted/[0.08] p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] md:p-6">
      <div><p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">{t("growth.level")}</p><div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-3xl font-semibold tracking-tight">Level {lifetime.level}</span><span className="text-sm text-primary">{lifetime.levelTitle}</span></div><p className="mt-1 text-[11px] text-muted-foreground">{t("growth.lifetime")}</p><div className="mt-5"><p className="text-[11px] text-muted-foreground">{t("growth.totalXp")}</p><p className="mt-0.5 text-xl font-semibold tabular-nums">{lifetime.totalXp.toLocaleString(language === "ko" ? "ko-KR" : "en-US")} XP</p></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/35"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(0, Math.min(100, lifetime.progressPercent))}%` }} /></div><div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span>{t("growth.currentLevel")} <strong className="font-medium text-foreground">{levelProgress.current} / {levelProgress.requirement} XP</strong></span><span>{t("growth.nextLevel", { xp: levelProgress.remaining })}</span></div></div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border/40 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0"><Summary label={t("growth.completed")} value={t("growth.sessionsUnit", { count: period.completedSessions })} /><Summary label={t("growth.trades")} value={t("growth.tradesUnit", { count: period.totalTrades })} /><Summary label={t("growth.averageReview")} value={formatProcessScore(period.averageSessionAiScore, language === "ko" ? "점" : " points")} /><Summary label={t("growth.periodLabel")} value={t(`growth.${period.key === "LAST_10" ? "last10" : period.key === "LAST_30" ? "last30" : "all"}`)} /></dl>
    </section>

    <section><SectionTitle title={t("growth.processMetrics")} description={t("growth.processDescription")} /><div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-border/45 bg-border/45 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Target />} label={t("growth.planRate")} metric={period.planSessionRate} note={t("growth.planNote")} /><Metric icon={<BrainCircuit />} label={t("growth.reasonRate")} metric={period.actionReasonRate} note={t("growth.reasonNote")} /><Metric icon={<ShieldCheck />} label={t("growth.riskRate")} metric={period.riskRuleSessionRate} note={t("growth.riskNote")} /><Metric icon={<Activity />} label={t("growth.reviewRate")} metric={period.aiReviewSessionRate} note={t("growth.reviewNote")} /></div></section>

    <section><SectionTitle title={t("growth.trend")} description={t("growth.trendDescription")} />{period.scoreTrend.length ? <ScoreTrend points={period.scoreTrend} /> : <div className="mt-4 border-y border-border/40 py-10 text-center text-sm text-muted-foreground">{t("growth.noTrend")}</div>}</section>
  </div>;
}

function ScoreTrend({ points }: { points: GrowthTrendPointResponse[] }) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const scoreSuffix = language === "ko" ? "점" : " points";
  const chart = useMemo(() => buildScoreChart(points), [points]);
  return <div className="mt-4 overflow-hidden rounded-xl border border-border/45 bg-muted/[0.05] p-3 sm:p-5"><svg viewBox="0 0 760 220" role="img" aria-label={t("growth.chartLabel")} className="h-auto w-full"><g className="stroke-border/50">{[0, 25, 50, 75, 100].map((score) => { const y = 12 + (100 - score) * 1.8; return <g key={score}><line x1="36" x2="748" y1={y} y2={y} /><text x="2" y={y + 4} className="fill-muted-foreground text-[10px] stroke-none">{score}</text></g>; })}</g>{chart.length > 1 && <polyline points={scorePolyline(chart)} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" />}{chart.map((point) => { const tooltip = formatTrendTooltip(point, locale, t("growth.noDate"), scoreSuffix); return <circle key={point.sessionId} cx={point.x} cy={point.y} r="5" tabIndex={0} aria-label={tooltip.replace("\n", ", ")} className="fill-background stroke-primary outline-none focus:fill-primary/20" strokeWidth="2"><title>{tooltip}</title></circle>; })}</svg><p className="mt-2 text-center text-[11px] text-muted-foreground">{t("growth.oldToNew")}</p></div>;
}

function Metric({ icon, label, metric, note }: { icon: React.ReactElement; label: string; metric: GrowthMetricResponse; note: string }) { return <div className="bg-background/80 p-4"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>{label}</div><p className="mt-3 text-2xl font-semibold tabular-nums">{metric.rate.toFixed(0)}%</p><p className="mt-1 text-[11px] text-muted-foreground">{metric.numerator}/{metric.denominator} · {note}</p></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd></div>; }
function SectionTitle({ title, description }: { title: string; description: string }) { return <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>; }
function GrowthSkeleton() { const { t } = useI18n(); return <div className="mt-7 space-y-7" aria-label={t("growth.loading")}><div className="h-48 animate-pulse rounded-xl bg-muted/20" /><div className="grid gap-2 sm:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-muted/20" />)}</div><div className="h-64 animate-pulse rounded-xl bg-muted/20" /></div>; }
function StateMessage({ title, description, action }: { title: string; description?: string; action: React.ReactNode }) { return <div className="py-24 text-center"><p className="text-sm font-medium">{title}</p>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}<div className="mt-4">{action}</div></div>; }

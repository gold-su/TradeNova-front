import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChartAiReviewContent } from "@/components/training/ai/ChartAiReviewContent";
import { SessionAiReviewContent } from "@/components/training/ai/SessionAiReviewContent";
import { parseChartAiPayload, parseSessionAiPayload } from "@/components/training/ai/aiReviewPayload";
import { useTrainingHistoryDetail } from "@/hooks/useTrainingHistory";
import type { TrainingHistoryChartResponse } from "@/types/training";
import { formatHistoryDate } from "./trainingHistoryBrowser";
import { useI18n } from "@/i18n/LanguageProvider";

export default function TrainingHistoryDetailPage() {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const { sessionId } = useParams();
  const parsedId = Number(sessionId);
  const history = useTrainingHistoryDetail(Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null);

  if (history.loading) return <DetailSkeleton />;
  if (history.error || !history.detail) return <DetailError onRetry={() => void history.load()} />;

  const { session, sessionAiReview, charts } = history.detail;
  const sessionPayload = parseSessionAiPayload(sessionAiReview?.payloadJson);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:py-10">
      <Link to="/mypage/history" className="text-xs text-muted-foreground transition hover:text-foreground">← {t("mypage.history")}</Link>
      <header className="mt-4 border-b border-border/45 pb-5"><p className="text-xs font-semibold tracking-[0.14em] text-primary">TRAINING HISTORY</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{t("mypage.historyPage.detailTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{formatHistoryDate(session.completedAt, locale, t("mypage.historyPage.unknownDate"))}</p></header>
      <dl className="grid grid-cols-3 gap-3 border-b border-border/45 py-5"><Metric label={t("training.completion.charts")} value={`${session.completedChartCount}/${session.totalChartCount}`} /><Metric label={t("training.completion.trades")} value={String(session.totalTradeCount)} /><Metric label={t("training.completion.snapshots")} value={String(session.snapshotCount)} /></dl>
      <section className="border-b border-border/45 py-7"><SectionHeading title="SESSION AI REVIEW" score={sessionPayload?.score ?? session.sessionAiScore} />{sessionPayload ? <div className="mt-5 max-w-3xl"><SessionAiReviewContent payload={sessionPayload} /></div> : <p className="mt-4 text-sm text-muted-foreground">{t("mypage.historyPage.noSessionReview")}</p>}</section>
      <section className="py-7"><h2 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">{t("mypage.historyPage.chartReviews")}</h2><div className="mt-3 divide-y divide-border/40 border-y border-border/40">{charts.map((chart) => <ChartReview key={chart.chartId} chart={chart} />)}</div></section>
    </div>
  );
}

function ChartReview({ chart }: { chart: TrainingHistoryChartResponse }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const payload = parseChartAiPayload(chart.chartAiReview?.payloadJson);
  const name = chart.symbolName || chart.symbolTicker || `Chart ${(chart.chartIndex ?? 0) + 1}`;
  return <article className="py-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-sm font-semibold">{name}</h3>{chart.sector && <span className="text-[10px] tracking-wide text-muted-foreground">{chart.sector}</span>}</div><p className="mt-1 text-xs text-muted-foreground">{t("training.completion.trades")} {chart.tradeCount} · {t("training.completion.snapshots")} {chart.snapshotCount}</p></div>{payload ? <Button variant="ghost" size="sm" className="shrink-0 text-xs" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}AI Review · {payload.score}</Button> : <span className="shrink-0 text-xs text-muted-foreground">{t("mypage.historyPage.noChartReview")}</span>}</div>{open && payload && <div className="mt-5 max-w-3xl border-l border-border/50 pl-4 sm:pl-5"><ChartAiReviewContent payload={payload} /></div>}</article>;
}

function SectionHeading({ title, score }: { title: string; score: number | null | undefined }) { return <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">{title}</h2>{score !== null && score !== undefined && <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs text-primary">AI Review · {score}</span>}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd></div>; }
function DetailSkeleton() { const { t } = useI18n(); return <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-7 sm:px-6 lg:py-10" aria-label={t("mypage.historyPage.detailLoading")}><div className="h-5 w-24 animate-pulse rounded bg-muted/25" /><div className="h-24 animate-pulse rounded-lg bg-muted/20" /><div className="h-52 animate-pulse rounded-lg bg-muted/20" /><div className="h-40 animate-pulse rounded-lg bg-muted/20" /></div>; }
function DetailError({ onRetry }: { onRetry: () => void }) { const { t } = useI18n(); return <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6"><p className="text-sm font-medium">{t("mypage.historyFailed")}</p><div className="mt-4 flex justify-center gap-2"><Button size="sm" variant="outline" onClick={onRetry}>{t("common.retry")}</Button><Button asChild size="sm" variant="ghost"><Link to="/mypage/history">{t("mypage.historyPage.back")}</Link></Button></div></div>; }

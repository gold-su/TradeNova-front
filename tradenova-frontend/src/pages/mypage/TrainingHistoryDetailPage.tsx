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

export default function TrainingHistoryDetailPage() {
  const { sessionId } = useParams();
  const parsedId = Number(sessionId);
  const history = useTrainingHistoryDetail(Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null);

  if (history.loading) return <DetailSkeleton />;
  if (history.error || !history.detail) return <DetailError onRetry={() => void history.load()} />;

  const { session, sessionAiReview, charts } = history.detail;
  const sessionPayload = parseSessionAiPayload(sessionAiReview?.payloadJson);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:py-10">
      <Link to="/mypage/history" className="text-xs text-muted-foreground transition hover:text-foreground">← 훈련 기록</Link>
      <header className="mt-4 border-b border-border/45 pb-5"><p className="text-xs font-semibold tracking-[0.14em] text-primary">TRAINING HISTORY</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">훈련 상세</h1><p className="mt-1 text-sm text-muted-foreground">{formatHistoryDate(session.completedAt)}</p></header>
      <dl className="grid grid-cols-3 gap-3 border-b border-border/45 py-5"><Metric label="차트" value={`${session.completedChartCount}/${session.totalChartCount}`} /><Metric label="거래" value={String(session.totalTradeCount)} /><Metric label="스냅샷" value={String(session.snapshotCount)} /></dl>
      <section className="border-b border-border/45 py-7"><SectionHeading title="SESSION AI REVIEW" score={sessionPayload?.score ?? session.sessionAiScore} />{sessionPayload ? <div className="mt-5 max-w-3xl"><SessionAiReviewContent payload={sessionPayload} /></div> : <p className="mt-4 text-sm text-muted-foreground">이 세션에는 저장된 AI 리뷰가 없습니다.</p>}</section>
      <section className="py-7"><h2 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">CHART REVIEWS</h2><div className="mt-3 divide-y divide-border/40 border-y border-border/40">{charts.map((chart) => <ChartReview key={chart.chartId} chart={chart} />)}</div></section>
    </div>
  );
}

function ChartReview({ chart }: { chart: TrainingHistoryChartResponse }) {
  const [open, setOpen] = useState(false);
  const payload = parseChartAiPayload(chart.chartAiReview?.payloadJson);
  const name = chart.symbolName || chart.symbolTicker || `Chart ${(chart.chartIndex ?? 0) + 1}`;
  return <article className="py-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-sm font-semibold">{name}</h3>{chart.sector && <span className="text-[10px] tracking-wide text-muted-foreground">{chart.sector}</span>}</div><p className="mt-1 text-xs text-muted-foreground">거래 {chart.tradeCount} · 스냅샷 {chart.snapshotCount}</p></div>{payload ? <Button variant="ghost" size="sm" className="shrink-0 text-xs" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}AI Review · {payload.score}</Button> : <span className="shrink-0 text-xs text-muted-foreground">AI 리뷰 없음</span>}</div>{open && payload && <div className="mt-5 max-w-3xl border-l border-border/50 pl-4 sm:pl-5"><ChartAiReviewContent payload={payload} /></div>}</article>;
}

function SectionHeading({ title, score }: { title: string; score: number | null | undefined }) { return <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">{title}</h2>{score !== null && score !== undefined && <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs text-primary">AI Review · {score}</span>}</div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd></div>; }
function DetailSkeleton() { return <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-7 sm:px-6 lg:py-10" aria-label="훈련 상세 불러오는 중"><div className="h-5 w-24 animate-pulse rounded bg-muted/25" /><div className="h-24 animate-pulse rounded-lg bg-muted/20" /><div className="h-52 animate-pulse rounded-lg bg-muted/20" /><div className="h-40 animate-pulse rounded-lg bg-muted/20" /></div>; }
function DetailError({ onRetry }: { onRetry: () => void }) { return <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6"><p className="text-sm font-medium">훈련 기록을 불러오지 못했습니다.</p><div className="mt-4 flex justify-center gap-2"><Button size="sm" variant="outline" onClick={onRetry}>다시 시도</Button><Button asChild size="sm" variant="ghost"><Link to="/mypage/history">훈련 기록으로 돌아가기</Link></Button></div></div>; }

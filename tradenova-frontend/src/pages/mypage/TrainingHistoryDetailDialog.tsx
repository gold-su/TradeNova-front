import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartAiReviewContent } from "@/components/training/ai/ChartAiReviewContent";
import { SessionAiReviewContent } from "@/components/training/ai/SessionAiReviewContent";
import { parseChartAiPayload, parseSessionAiPayload } from "@/components/training/ai/aiReviewPayload";
import { WorkspaceDialog } from "@/components/training/common/WorkspaceDialog";
import type { TrainingHistoryDetailResponse } from "@/types/training";
import { formatHistoryDate } from "./trainingHistoryBrowser";

type Props = { detail: TrainingHistoryDetailResponse | null; loading: boolean; error: boolean; onRetry: () => void; onClose: () => void };

export function TrainingHistoryDetailDialog({ detail, loading, error, onRetry, onClose }: Props) {
  const [expandedChartId, setExpandedChartId] = useState<number | null>(null);
  const sessionPayload = parseSessionAiPayload(detail?.sessionAiReview?.payloadJson);
  return (
    <WorkspaceDialog title="훈련 상세" description={detail ? formatHistoryDate(detail.session.completedAt) : "저장된 세션 결과"} onClose={onClose} wide>
      <div className="thin-scrollbar flex-1 overflow-y-auto px-5 pb-5">
        {loading && <DetailSkeleton />}
        {error && <div className="py-10 text-center"><p className="text-sm text-muted-foreground">상세 기록을 불러오지 못했습니다.</p><Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>다시 시도</Button></div>}
        {detail && <>
          <dl className="grid grid-cols-3 border-y border-border/40 py-3 text-center"><Metric label="차트" value={`${detail.session.completedChartCount}/${detail.session.totalChartCount}`} /><Metric label="거래" value={`${detail.session.totalTradeCount}`} /><Metric label="스냅샷" value={`${detail.session.snapshotCount}`} /></dl>
          <section className="py-6" aria-labelledby="session-ai-heading"><h3 id="session-ai-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Session AI Review</h3>{sessionPayload ? <div className="mt-4"><SessionAiReviewContent payload={sessionPayload} /></div> : <p className="mt-3 text-sm text-muted-foreground">저장된 Session AI 리뷰가 없습니다.</p>}</section>
          <section className="border-t border-border/40 pt-5" aria-labelledby="history-charts-heading"><h3 id="history-charts-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Charts</h3><div className="mt-2 divide-y divide-border/35">{detail.charts.map((chart, index) => {
            const chartPayload = parseChartAiPayload(chart.chartAiReview?.payloadJson);
            const expanded = expandedChartId === chart.chartId;
            return <div key={chart.chartId} className="py-3"><div className="flex items-center gap-3"><span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}.</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{chart.symbolName || chart.symbolTicker || `Chart ${chart.chartIndex ?? chart.chartId}`}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">거래 {chart.tradeCount} · 스냅샷 {chart.snapshotCount}{chart.sector ? ` · ${chart.sector}` : ""}</p></div>{chartPayload ? <button type="button" onClick={() => setExpandedChartId(expanded ? null : chart.chartId)} aria-expanded={expanded} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-primary hover:bg-primary/10">AI Review {chartPayload.score}{expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button> : <span className="shrink-0 text-[11px] text-muted-foreground">AI 리뷰 없음</span>}</div>{expanded && chartPayload && <div className="ml-8 mt-4 rounded-xl bg-muted/[0.12] p-4"><ChartAiReviewContent payload={chartPayload} /></div>}</div>;
          })}</div></section>
        </>}
      </div>
    </WorkspaceDialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dd className="text-lg font-semibold tabular-nums">{value}</dd><dt className="mt-0.5 text-[10px] text-muted-foreground">{label}</dt></div>; }
function DetailSkeleton() { return <div className="space-y-3 py-3" aria-label="훈련 상세 불러오는 중"><div className="h-14 animate-pulse rounded-lg bg-muted/25" /><div className="h-40 animate-pulse rounded-lg bg-muted/20" /><div className="h-24 animate-pulse rounded-lg bg-muted/20" /></div>; }

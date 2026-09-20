import { Button } from "@/components/ui/button";
import { WorkspaceDialog } from "@/components/training/common/WorkspaceDialog";
import type { TrainingHistoryDetailResponse } from "@/types/training";
import { getSessionAiLabel } from "./myPageState";

type Props = { detail: TrainingHistoryDetailResponse | null; loading: boolean; error: boolean; onRetry: () => void; onClose: () => void };

export function TrainingHistoryDetailDialog({ detail, loading, error, onRetry, onClose }: Props) {
  const aiLabel = detail ? getSessionAiLabel(detail.session) : null;
  return (
    <WorkspaceDialog title="훈련 상세" description={detail ? formatCompletedAt(detail.session.completedAt) : "저장된 세션 결과"} onClose={onClose} medium>
      <div className="max-h-[70dvh] overflow-y-auto px-5 pb-5">
        {loading && <div className="space-y-3 py-3" aria-label="훈련 상세 불러오는 중"><div className="h-14 animate-pulse rounded-lg bg-muted/25" /><div className="h-24 animate-pulse rounded-lg bg-muted/20" /><div className="h-16 animate-pulse rounded-lg bg-muted/20" /></div>}
        {error && <div className="py-10 text-center"><p className="text-sm text-muted-foreground">상세 기록을 불러오지 못했습니다.</p><Button size="sm" variant="outline" className="mt-4" onClick={onRetry}>다시 시도</Button></div>}
        {detail && <>
          <dl className="grid grid-cols-3 border-y border-border/40 py-3 text-center"><Metric label="차트" value={`${detail.session.completedChartCount}/${detail.session.totalChartCount}`} /><Metric label="거래" value={`${detail.session.totalTradeCount}`} /><Metric label="스냅샷" value={`${detail.session.snapshotCount}`} /></dl>
          {aiLabel && <section aria-labelledby="session-review-heading" className="py-5"><div className="flex items-center justify-between gap-3"><h3 id="session-review-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Review</h3><span className="text-[11px] font-medium text-primary/85">{aiLabel}</span></div>{typeof detail.sessionAiReview?.payloadJson?.summary === "string" ? <p className="mt-2 text-sm leading-6 text-foreground/85">{detail.sessionAiReview.payloadJson.summary}</p> : <p className="mt-2 text-xs text-muted-foreground">저장된 AI 리뷰가 있습니다.</p>}</section>}
          <section aria-labelledby="charts-heading" className={aiLabel ? "border-t border-border/40 pt-5" : "pt-5"}>
            <h3 id="charts-heading" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Charts</h3>
            <ol className="mt-2 divide-y divide-border/35">{detail.charts.map((chart, index) => <li key={chart.chartId} className="flex items-center gap-3 py-3"><span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}.</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium" title={chart.symbolName || chart.symbolTicker || undefined}>{chart.symbolName || chart.symbolTicker || `Chart ${chart.chartIndex ?? chart.chartId}`}</p><p className="mt-0.5 truncate text-xs tabular-nums text-muted-foreground">거래 {chart.tradeCount} · 스냅샷 {chart.snapshotCount}{chart.sector ? ` · ${chart.sector}` : ""}</p></div>{chart.hasChartAiReview && <span className="shrink-0 text-[11px] font-medium text-primary/75">{chart.chartAiScore === null ? "AI Review" : `AI Review ${chart.chartAiScore}`}</span>}</li>)}</ol>
          </section>
        </>}
      </div>
    </WorkspaceDialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div><dd className="text-lg font-semibold tabular-nums">{value}</dd><dt className="mt-0.5 text-[10px] text-muted-foreground">{label}</dt></div>; }
function formatCompletedAt(value: string | null) { return value ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short" }).format(new Date(value)) : "완료 시각 없음"; }

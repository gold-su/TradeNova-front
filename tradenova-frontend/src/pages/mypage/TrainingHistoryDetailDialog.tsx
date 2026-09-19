import { Button } from "@/components/ui/button";
import { WorkspaceDialog } from "@/components/training/common/WorkspaceDialog";
import type { TrainingHistoryDetailResponse } from "@/types/training";
import { getSessionAiLabel } from "./myPageState";

type Props = {
  detail: TrainingHistoryDetailResponse | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onClose: () => void;
};

export function TrainingHistoryDetailDialog({ detail, loading, error, onRetry, onClose }: Props) {
  return (
    <WorkspaceDialog title="훈련 기록 상세" description="저장된 세션과 차트별 결과입니다." onClose={onClose} medium>
      <div className="max-h-[70dvh] overflow-y-auto px-5 pb-5">
        {loading && <div className="space-y-2 py-4" aria-label="훈련 상세 불러오는 중"><div className="h-16 animate-pulse rounded-lg bg-muted/30" /><div className="h-20 animate-pulse rounded-lg bg-muted/30" /></div>}
        {error && <div className="py-8 text-center"><p className="text-sm">상세 기록을 불러오지 못했습니다.</p><Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>다시 시도</Button></div>}
        {detail && <>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/20 p-3 text-center">
            <Metric label="차트" value={`${detail.session.completedChartCount}/${detail.session.totalChartCount}`} />
            <Metric label="거래" value={`${detail.session.totalTradeCount}`} />
            <Metric label="스냅샷" value={`${detail.session.snapshotCount}`} />
          </div>
          {getSessionAiLabel(detail.session) && <div className="mt-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-3"><p className="text-xs font-semibold text-primary">{getSessionAiLabel(detail.session)}</p>{typeof detail.sessionAiReview?.payloadJson?.summary === "string" && <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail.sessionAiReview.payloadJson.summary}</p>}</div>}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">차트별 기록</p>
            {detail.charts.map((chart) => <div key={chart.chartId} className="flex items-center justify-between gap-3 border-b border-border/40 py-2 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{chart.symbolName || chart.symbolTicker || `Chart ${chart.chartIndex ?? chart.chartId}`}</p><p className="text-xs text-muted-foreground">거래 {chart.tradeCount} · 스냅샷 {chart.snapshotCount}{chart.sector ? ` · ${chart.sector}` : ""}</p></div>{chart.hasChartAiReview && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] text-primary">{chart.chartAiScore === null ? "AI 리뷰" : `${chart.chartAiScore}점`}</span>}</div>)}
          </div>
        </>}
      </div>
    </WorkspaceDialog>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-base font-semibold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>;
}

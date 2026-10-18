import type { ChartAiPayload } from "@/types/training";
import { ReviewList, ReviewSection, ReviewSummary } from "@/components/training/ai/ReviewPresentation";

export function ChartAiReviewContent({ payload }: { payload: ChartAiPayload }) {
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-xs font-semibold text-primary/90">
          AI Review · {payload.score}
        </div>
        <p className="text-xs text-muted-foreground">{payload.analysisType === "DEEP" ? "스냅샷 기반 정밀 분석" : "거래/포지션 기반 빠른 분석"}</p>
      </div>
      <ReviewSummary>{payload.summary}</ReviewSummary>
      {!!payload.strengths.length && (
        <ReviewSection title="잘 본 점" tone="positive">
          <ReviewList items={payload.strengths} tone="positive" />
        </ReviewSection>
      )}
      {!!payload.warnings.length && (
        <ReviewSection title="주의하거나 놓친 점" tone="warning">
          <ReviewList items={payload.warnings} tone="warning" />
        </ReviewSection>
      )}
    </div>
  );
}

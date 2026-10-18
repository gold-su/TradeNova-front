import type { SessionAiPayload } from "@/types/training";
import { getSessionAiReviewVisibility } from "@/components/training/ai/sessionAiReview";
import { ReviewDetail, ReviewInlineText, ReviewList, ReviewSection, ReviewSummary } from "@/components/training/ai/ReviewPresentation";

type Props = { payload: SessionAiPayload };

export function SessionAiReviewContent({ payload }: Props) {
  const visible = getSessionAiReviewVisibility(payload);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center">
        <div className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-xs font-semibold text-primary/90">
          점수 {payload.score}점
        </div>
      </div>
      <ReviewSummary>{payload.summary}</ReviewSummary>

      {!!payload.strengths?.length && <ReviewSection title="잘 본 점" tone="positive"><ReviewList items={payload.strengths} tone="positive" /></ReviewSection>}
      {!!payload.warnings?.length && <ReviewSection title="주의하거나 놓친 점" tone="warning"><ReviewList items={payload.warnings} tone="warning" /></ReviewSection>}

      {visible.decisionReview && payload.decisionReview && (
        <ReviewSection title="판단 품질">
          <ReviewDetail label="평가">{payload.decisionReview.assessment}</ReviewDetail>
          <ReviewList items={payload.decisionReview.evidence} />
          <ReviewDetail label="다음에는 이렇게 해보세요">{payload.decisionReview.betterAction}</ReviewDetail>
        </ReviewSection>
      )}

      {visible.riskReview && payload.riskReview && (
        <ReviewSection title="계획과 리스크">
          <ReviewDetail label="평가">{payload.riskReview.assessment}</ReviewDetail>
          <ReviewList items={payload.riskReview.evidence} />
          <ReviewDetail label="개선 방법">{payload.riskReview.improvement}</ReviewDetail>
        </ReviewSection>
      )}

      {visible.behaviorPatterns && !!payload.behaviorPatterns?.length && (
        <ReviewSection title="반복된 행동 패턴">
          <div className="mt-3 divide-y divide-border/40">
            {payload.behaviorPatterns.map((item, index) => (
              <div key={`${item.pattern}-${index}`} className="py-4 first:pt-0 last:pb-0">
                <h4 className="break-words text-sm font-semibold text-foreground/90 [overflow-wrap:anywhere]"><ReviewInlineText>{item.pattern}</ReviewInlineText></h4>
                <ReviewList items={item.evidence} />
                <ReviewDetail label="영향">{item.impact}</ReviewDetail>
                <ReviewDetail label="교정">{item.correction}</ReviewDetail>
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {visible.nextTrainingFocus && !!payload.nextTrainingFocus?.length && (
        <ReviewSection title="다음 훈련에서 기억할 점" tone="focus">
          <ReviewList items={payload.nextTrainingFocus} tone="focus" />
        </ReviewSection>
      )}
    </div>
  );
}

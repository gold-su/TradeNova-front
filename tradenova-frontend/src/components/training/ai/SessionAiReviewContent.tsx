import type { SessionAiPayload } from "@/types/training";
import { getSessionAiReviewVisibility } from "@/components/training/ai/sessionAiReview";
import { ReviewDetail, ReviewInlineText, ReviewList, ReviewSection, ReviewSummary } from "@/components/training/ai/ReviewPresentation";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = { payload: SessionAiPayload };

export function SessionAiReviewContent({ payload }: Props) {
  const { t } = useI18n();
  const visible = getSessionAiReviewVisibility(payload);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-center">
        <div className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-xs font-semibold text-primary/90">
          {t("training.review.score", { score: payload.score })}
        </div>
      </div>
      <ReviewSummary>{payload.summary}</ReviewSummary>

      {!!payload.strengths?.length && <ReviewSection title={t("training.review.strengths")} tone="positive"><ReviewList items={payload.strengths} tone="positive" /></ReviewSection>}
      {!!payload.warnings?.length && <ReviewSection title={t("training.review.warnings")} tone="warning"><ReviewList items={payload.warnings} tone="warning" /></ReviewSection>}

      {visible.decisionReview && payload.decisionReview && (
        <ReviewSection title={t("training.review.decisionQuality")}>
          <ReviewDetail label={t("training.review.assessment")}>{payload.decisionReview.assessment}</ReviewDetail>
          <ReviewList items={payload.decisionReview.evidence} />
          <ReviewDetail label={t("training.review.betterAction")}>{payload.decisionReview.betterAction}</ReviewDetail>
        </ReviewSection>
      )}

      {visible.riskReview && payload.riskReview && (
        <ReviewSection title={t("training.review.riskPlan")}>
          <ReviewDetail label={t("training.review.assessment")}>{payload.riskReview.assessment}</ReviewDetail>
          <ReviewList items={payload.riskReview.evidence} />
          <ReviewDetail label={t("training.review.improvement")}>{payload.riskReview.improvement}</ReviewDetail>
        </ReviewSection>
      )}

      {visible.behaviorPatterns && !!payload.behaviorPatterns?.length && (
        <ReviewSection title={t("training.review.behavior")}>
          <div className="mt-3 divide-y divide-border/40">
            {payload.behaviorPatterns.map((item, index) => (
              <div key={`${item.pattern}-${index}`} className="py-4 first:pt-0 last:pb-0">
                <h4 className="break-words text-sm font-semibold text-foreground/90 [overflow-wrap:anywhere]"><ReviewInlineText>{item.pattern}</ReviewInlineText></h4>
                <ReviewList items={item.evidence} />
                <ReviewDetail label={t("training.review.impact")}>{item.impact}</ReviewDetail>
                <ReviewDetail label={t("training.review.correction")}>{item.correction}</ReviewDetail>
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {visible.nextTrainingFocus && !!payload.nextTrainingFocus?.length && (
        <ReviewSection title={t("training.review.nextFocus")} tone="focus">
          <ReviewList items={payload.nextTrainingFocus} tone="focus" />
        </ReviewSection>
      )}
    </div>
  );
}

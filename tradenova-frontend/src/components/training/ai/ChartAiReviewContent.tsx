import type { ChartAiPayload } from "@/types/training";
import { ReviewList, ReviewSection, ReviewSummary } from "@/components/training/ai/ReviewPresentation";
import { useI18n } from "@/i18n/LanguageProvider";

export function ChartAiReviewContent({ payload }: { payload: ChartAiPayload }) {
  const { t } = useI18n();
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="rounded-full border border-primary/20 bg-primary/[0.07] px-2.5 py-1 text-xs font-semibold text-primary/90">
          AI Review · {payload.score}
        </div>
        <p className="text-xs text-muted-foreground">{payload.analysisType === "DEEP" ? t("training.review.deep") : t("training.review.quick")}</p>
      </div>
      <ReviewSummary>{payload.summary}</ReviewSummary>
      {!!payload.strengths.length && (
        <ReviewSection title={t("training.review.strengths")} tone="positive">
          <ReviewList items={payload.strengths} tone="positive" />
        </ReviewSection>
      )}
      {!!payload.warnings.length && (
        <ReviewSection title={t("training.review.warnings")} tone="warning">
          <ReviewList items={payload.warnings} tone="warning" />
        </ReviewSection>
      )}
    </div>
  );
}

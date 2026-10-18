import type { SessionAiPayload } from "@/types/training";

export const ACTIVE_AI_REVIEW_TARGETS = ["CHART"] as const;
export const GENERATED_REVIEW_ACTION_LABEL = "보기";
export const EXISTING_SESSION_AI_ACTION_LABEL = "저장된 분석 불러오기";

export function getSessionAiAction(
  hasLoadedPayload: boolean,
  hasStoredAnalysis: boolean,
) {
  if (hasLoadedPayload) return null;
  return hasStoredAnalysis ? "LOAD" : "GENERATE";
}

export function getSessionAiReviewVisibility(payload: SessionAiPayload) {
  return {
    decisionReview: Boolean(payload.decisionReview),
    riskReview: Boolean(payload.riskReview),
    behaviorPatterns: Boolean(payload.behaviorPatterns?.length),
    nextTrainingFocus: Boolean(payload.nextTrainingFocus?.length),
  };
}

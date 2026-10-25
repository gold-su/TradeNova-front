import type { ReportDraftContent } from "@/types/training";
import type { ScenarioContent } from "@/components/training/common/scenarioDraftState";
import type { PlanRelation } from "./training.types";

export const CURRENT_VIEW_OPTIONS = [
  { value: "BULLISH", label: "Bullish · 상승" },
  { value: "NEUTRAL", label: "Neutral · 중립" },
  { value: "BEARISH", label: "Bearish · 하락" },
] as const;

export const INVALIDATION_ACTION_OPTIONS = [
  { value: "EXIT", label: "Exit · 청산" },
  { value: "REDUCE", label: "Reduce · 축소" },
  { value: "WAIT", label: "Wait · 관망" },
  { value: "REASSESS", label: "Reassess · 재검토" },
] as const;

export const PLAN_RELATION_OPTIONS: readonly {
  value: PlanRelation;
  label: string;
  description: string;
}[] = [
  {
    value: "FOLLOWED_PLAN",
    label: "계획대로",
    description: "저장한 기준에 따라 행동",
  },
  {
    value: "CHANGED_PLAN",
    label: "계획 변경",
    description: "새 정보로 계획을 수정",
  },
  {
    value: "UNPLANNED",
    label: "즉흥 판단",
    description: "저장한 계획 없이 판단",
  },
] as const;

export function decisionPlanRelationLabel(value?: string | null) {
  return PLAN_RELATION_OPTIONS.find((option) => option.value === value)?.label ?? "판단";
}

export function decisionPlanRelationFeedback(value?: PlanRelation | null) {
  const label = decisionPlanRelationLabel(value);
  return `${label}${value === "FOLLOWED_PLAN" ? " 실행" : ""}으로 기록했습니다.`;
}

export function decisionCurrentViewLabel(value?: string) {
  return CURRENT_VIEW_OPTIONS.find((option) => option.value === value)?.label ?? value ?? "—";
}

export function isDecisionCaptureComplete(content: ScenarioContent) {
  return Boolean(
    CURRENT_VIEW_OPTIONS.some((option) => option.value === content.thesis) &&
      content.entryReason.trim() &&
      content.riskNote.trim() &&
      INVALIDATION_ACTION_OPTIONS.some((option) => option.value === content.exitPlan),
  );
}

export function toDecisionCaptureContent(content: ScenarioContent): ReportDraftContent {
  return {
    currentView: content.thesis as ReportDraftContent["currentView"],
    entryCondition: content.entryReason.trim(),
    invalidationCondition: content.riskNote.trim(),
    ifInvalidated: content.exitPlan as ReportDraftContent["ifInvalidated"],
    // Legacy aliases keep persisted history and the existing review pipeline compatible.
    thesis: content.thesis,
    entryReason: content.entryReason.trim(),
    riskNote: content.riskNote.trim(),
    exitPlan: content.exitPlan,
    freeNote: content.freeNote,
    tags: ["SCENARIO", "DECISION_CAPTURE_V1"],
  };
}

export function fromDecisionCaptureContent(content: ReportDraftContent): ScenarioContent {
  return {
    thesis: content.currentView ?? content.thesis ?? "",
    entryReason: content.entryCondition ?? content.entryReason ?? "",
    riskNote: content.invalidationCondition ?? content.riskNote ?? "",
    exitPlan: content.ifInvalidated ?? content.exitPlan ?? "",
    freeNote: content.freeNote ?? "",
  };
}

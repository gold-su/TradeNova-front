import type { ReportDraftContent } from "@/types/training";
import type { ScenarioContent } from "@/components/training/common/scenarioDraftState";

export const CURRENT_VIEW_OPTIONS = [
  { value: "BULLISH", label: "상승 관점" },
  { value: "BEARISH", label: "하락 관점" },
  { value: "NEUTRAL", label: "중립" },
] as const;

export const INVALIDATION_ACTION_OPTIONS = [
  { value: "EXIT", label: "청산" },
  { value: "REDUCE", label: "비중 축소" },
  { value: "WAIT", label: "관망" },
  { value: "REASSESS", label: "다시 판단" },
] as const;

export function decisionCurrentViewLabel(value?: string) {
  return CURRENT_VIEW_OPTIONS.find((option) => option.value === value)?.label ?? value ?? "—";
}

export function isDecisionCaptureComplete(content: ScenarioContent) {
  return Boolean(
    content.thesis.trim() &&
      content.entryReason.trim() &&
      content.riskNote.trim() &&
      content.exitPlan.trim(),
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

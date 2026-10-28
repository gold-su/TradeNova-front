import type { ReportDocumentResponse, TradeResponse } from "@/types/training";
import type { PlanRelation, TradeForm, TradeReasonItem } from "./training.types";

export function clearPendingTradeReason(tradeForm: TradeForm): TradeForm {
  return {
    ...tradeForm,
    entryReason: "",
    riskNote: "",
    reasons: [],
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
    planRelation: null,
    changeReason: "",
  };
}

export function reconcileScenarioSelection(
  tradeForm: TradeForm,
  availableScenarios: ReportDocumentResponse[] | ReportDocumentResponse | null,
): TradeForm {
  if (tradeForm.reasonMode !== "SCENARIO") return tradeForm;

  const scenarios = Array.isArray(availableScenarios)
    ? availableScenarios
    : availableScenarios
      ? [availableScenarios]
      : [];
  if (
    scenarios.some((scenario) => scenario.id === tradeForm.scenarioSnapshotId)
  ) {
    return tradeForm;
  }

  return {
    ...tradeForm,
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
    planRelation: null,
    changeReason: "",
  };
}

export function selectPlanRelation(
  tradeForm: TradeForm,
  planRelation: PlanRelation,
  scenarios: ReportDocumentResponse[],
): TradeForm {
  if (planRelation === "UNPLANNED") {
    return {
      ...tradeForm,
      planRelation,
      reasonMode: "MANUAL",
      scenarioSnapshotId: null,
      changeReason: "",
    };
  }
  const keepsExplicitSelection =
    tradeForm.planRelation === planRelation &&
    scenarios.some((item) => item.id === tradeForm.scenarioSnapshotId);
  const selected = keepsExplicitSelection
    ? tradeForm.scenarioSnapshotId
    : scenarios[0]?.id ?? null;
  return {
    ...tradeForm,
    planRelation,
    reasonMode: selected == null ? "MANUAL" : "SCENARIO",
    scenarioSnapshotId: selected,
    changeReason: planRelation === "CHANGED_PLAN" ? tradeForm.changeReason : "",
  };
}

export function canSubmitDecisionAction(tradeForm: TradeForm) {
  if (!tradeForm.planRelation) return false;
  if (
    tradeForm.planRelation !== "UNPLANNED" &&
    (tradeForm.reasonMode !== "SCENARIO" || tradeForm.scenarioSnapshotId == null)
  ) return false;
  return tradeForm.planRelation !== "CHANGED_PLAN" || Boolean(tradeForm.changeReason.trim());
}

export function selectTradeScenario(
  tradeForm: TradeForm,
  scenarioSnapshotId: number | null,
  scenarios: ReportDocumentResponse[],
): TradeForm {
  const scenario = scenarios.find((item) => item.id === scenarioSnapshotId);
  return {
    ...tradeForm,
    reasonMode: scenario ? "SCENARIO" : "MANUAL",
    scenarioSnapshotId: scenario?.id ?? null,
    planRelation: scenario
      ? tradeForm.planRelation === "CHANGED_PLAN"
        ? "CHANGED_PLAN"
        : "FOLLOWED_PLAN"
      : "UNPLANNED",
    changeReason: scenario && tradeForm.planRelation === "CHANGED_PLAN"
      ? tradeForm.changeReason
      : "",
  };
}

export function findLatestScenarioSnapshot(
  snapshots: ReportDocumentResponse[],
  activeChartId: number | null,
) {
  if (activeChartId == null) return null;

  return (
    snapshots
      .filter(
        (snapshot) =>
          snapshot.chartId === activeChartId &&
          snapshot.contentJson.tags?.includes("SCENARIO"),
      )
      .sort((a, b) => {
        const createdOrder = Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return createdOrder || b.id - a.id;
      })[0] ?? null
  );
}

export function createScenarioClaim(
  side: "BUY" | "SELL",
  planRelation: PlanRelation,
  createdAt = new Date().toISOString(),
  copy = {
    followedTitle: "기존 계획 실행",
    changedTitle: "계획 변경 후 실행",
    entryConditionMet: "진입 조건이 충족되었다고 사용자가 기록함",
    exitConditionMet: "청산 조건이 충족되었다고 사용자가 기록함",
    changedReason: "사전 계획을 변경해 실행했다고 사용자가 기록함",
  },
): TradeReasonItem {
  return {
    id: `scenario-${side.toLowerCase()}`,
    title: planRelation === "FOLLOWED_PLAN" ? copy.followedTitle : copy.changedTitle,
    entryReason: planRelation === "FOLLOWED_PLAN"
      ? side === "BUY" ? copy.entryConditionMet : copy.exitConditionMet
      : copy.changedReason,
    riskNote: "",
    createdAt,
  };
}

export function buildTradeEventPayload({
  side,
  qty,
  res,
  tradeForm,
  sellAll = false,
  claimCopy,
}: {
  side: "BUY" | "SELL";
  qty?: number;
  res: TradeResponse;
  tradeForm: TradeForm;
  sellAll?: boolean;
  claimCopy?: Parameters<typeof createScenarioClaim>[3];
}) {
  const scenarioSelected = tradeForm.planRelation !== "UNPLANNED" &&
    tradeForm.reasonMode === "SCENARIO" && tradeForm.scenarioSnapshotId != null;
  const reasons = [
    ...(scenarioSelected && tradeForm.planRelation
      ? [createScenarioClaim(side, tradeForm.planRelation, undefined, claimCopy)]
      : []),
    ...(tradeForm.reasons ?? []),
  ];

  return {
    side,
    qty,
    price: res.executedPrice,
    tradeId: res.tradeId,
    candleTime: res.candleTime,
    ...(scenarioSelected
      ? {
          scenarioSnapshotId: tradeForm.scenarioSnapshotId,
          reasonMode: "SCENARIO" as const,
        }
      : { reasonMode: "MANUAL" as const }),
    ...(tradeForm.planRelation ? { planRelation: tradeForm.planRelation } : {}),
    ...(tradeForm.planRelation === "CHANGED_PLAN"
      ? { changeReason: tradeForm.changeReason.trim() }
      : {}),
    reasons,
    reasonCount: reasons.length,
    savedForAiReview: true,
    sellAll,
    reasonVersion: 2,
  };
}

export function buildWaitEventPayload({
  candleTime,
  price,
  tradeForm,
}: {
  candleTime: number | null;
  price: number | null;
  tradeForm: TradeForm;
}) {
  const scenarioSelected = tradeForm.planRelation !== "UNPLANNED" &&
    tradeForm.reasonMode === "SCENARIO" && tradeForm.scenarioSnapshotId != null;
  return {
    side: "WAIT" as const,
    candleTime,
    price,
    ...(scenarioSelected
      ? { reasonMode: "SCENARIO" as const, scenarioSnapshotId: tradeForm.scenarioSnapshotId }
      : { reasonMode: "MANUAL" as const }),
    ...(tradeForm.planRelation ? { planRelation: tradeForm.planRelation } : {}),
    ...(tradeForm.planRelation === "CHANGED_PLAN"
      ? { changeReason: tradeForm.changeReason.trim() }
      : {}),
    reasons: tradeForm.reasons ?? [],
    reasonCount: tradeForm.reasons?.length ?? 0,
    savedForAiReview: true,
    reasonVersion: 3,
  };
}

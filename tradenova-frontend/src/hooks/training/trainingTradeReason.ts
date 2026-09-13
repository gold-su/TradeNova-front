import type { ReportDocumentResponse, TradeResponse } from "@/types/training";
import type { TradeForm, TradeReasonItem } from "./training.types";

export function clearPendingTradeReason(tradeForm: TradeForm): TradeForm {
  return {
    ...tradeForm,
    entryReason: "",
    riskNote: "",
    reasons: [],
    reasonMode: "MANUAL",
    scenarioSnapshotId: null,
  };
}

export function findLatestScenarioSnapshot(
  snapshots: ReportDocumentResponse[],
  activeChartId: number | null,
) {
  if (activeChartId == null) return null;

  return snapshots
    .filter(
      (snapshot) =>
        snapshot.chartId === activeChartId &&
        snapshot.contentJson.tags?.includes("SCENARIO"),
    )
    .sort((a, b) => {
      const createdOrder = Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return createdOrder || b.id - a.id;
    })[0] ?? null;
}

export function createScenarioClaim(
  side: "BUY" | "SELL",
  createdAt = new Date().toISOString(),
): TradeReasonItem {
  return {
    id: `scenario-${side.toLowerCase()}`,
    title: side === "BUY" ? "사전 계획대로 진입" : "사전 계획대로 청산",
    entryReason:
      side === "BUY"
        ? "사전 시나리오의 진입 조건이 충족되었다고 판단"
        : "사전 시나리오의 청산 또는 무효화 조건에 따라 실행했다고 판단",
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
}: {
  side: "BUY" | "SELL";
  qty?: number;
  res: TradeResponse;
  tradeForm: TradeForm;
  sellAll?: boolean;
}) {
  const scenarioSelected =
    tradeForm.reasonMode === "SCENARIO" &&
    tradeForm.scenarioSnapshotId != null;
  const reasons = [
    ...(scenarioSelected ? [createScenarioClaim(side)] : []),
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
    reasons,
    reasonCount: reasons.length,
    savedForAiReview: true,
    sellAll,
    reasonVersion: 2,
  };
}

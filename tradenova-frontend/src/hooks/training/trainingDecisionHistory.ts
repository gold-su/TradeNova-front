import type {
  ReportDocumentResponse,
  TrainingEventResponse,
} from "@/types/training";

export const SCENARIO_FIELDS = [
  {
    key: "entryReason",
    label: "진입 조건",
    helper: "어떤 조건이 되면 진입할 건가요?",
    example: "예: 최근 고점 돌파와 거래량 증가를 함께 확인할 때",
  },
  {
    key: "riskNote",
    label: "무효화 조건",
    helper: "어떤 변화가 생기면 지금 판단이 틀렸다고 볼 건가요?",
    example: "예: 종가가 최근 저점 아래로 내려가면 현재 관점 무효화",
  },
] as const;

export function getScenarioHistory(
  items: ReportDocumentResponse[],
  chartId: number | null,
) {
  return items
    .filter(
      (item) =>
        item.chartId === chartId && item.contentJson.tags?.includes("SCENARIO"),
    )
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
    );
}
const text = (value: unknown) => (typeof value === "string" ? value : "");
function readReason(value: unknown) {
  const data =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    id: text(data.id),
    title: text(data.title),
    entryReason: text(data.entryReason),
    riskNote: text(data.riskNote),
  };
}
export function getTradeReasonHistory(
  items: TrainingEventResponse[],
  chartId: number | null,
) {
  return items
    .filter((item) => item.chartId === chartId && item.type === "TRADE")
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id,
    )
    .map((item) => {
      const payload = item.payloadJson ?? {};
      const reasons = (
        Array.isArray(payload.reasons)
          ? payload.reasons.map(readReason)
          : [readReason(payload)]
      ).filter(
        (reason) => reason.title || reason.entryReason || reason.riskNote,
      );
      const linked =
        payload.reasonMode === "SCENARIO" && payload.scenarioSnapshotId != null;
      const manualCount = reasons.filter(
        (reason) => !reason.id.startsWith("scenario-"),
      ).length;
      return {
        id: item.id,
        createdAt: item.createdAt,
        side:
          payload.side === "WAIT"
            ? "WAIT"
            : payload.side === "SELL" || item.title.includes("SELL")
              ? "SELL"
              : "BUY",
        planRelation:
          payload.planRelation === "FOLLOWED_PLAN" ||
          payload.planRelation === "CHANGED_PLAN" ||
          payload.planRelation === "UNPLANNED"
            ? payload.planRelation
            : null,
        changeReason: text(payload.changeReason),
        manualCount,
        scenarioId: linked ? Number(payload.scenarioSnapshotId) : null,
        qty:
          typeof payload.qty === "number" && Number.isFinite(payload.qty)
            ? payload.qty
            : null,
        price:
          typeof payload.price === "number" && Number.isFinite(payload.price)
            ? payload.price
            : null,
        reasons,
      };
    })
    .filter(
      (item) =>
        item.reasons.length > 0 ||
        item.scenarioId != null ||
        item.planRelation != null,
    );
}

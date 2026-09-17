import type {
  ReportDocumentResponse,
  TrainingEventResponse,
} from "@/types/training";

export const SCENARIO_FIELDS = [
  {
    key: "thesis",
    label: "시장 관점",
    helper: "현재 차트를 어떻게 보고 있나요?",
    example: "예: 최근 저점 부근에서 매수세 유입 가능성을 관찰",
  },
  {
    key: "entryReason",
    label: "진입 조건",
    helper: "어떤 조건이 확인되면 진입하나요?",
    example:
      "예: 최근 저점을 유지하며 거래량이 20봉 평균 대비 증가할 경우 진입",
  },
  {
    key: "exitPlan",
    label: "청산 계획",
    helper: "어떤 상황에서 포지션을 정리하나요?",
    example: "예: 손절가 도달 시 전량 청산, 목표가 도달 시 계획대로 익절",
  },
  {
    key: "riskNote",
    label: "계획 무효화",
    helper: "어떤 상황이면 기존 판단을 폐기하나요?",
    example: "예: 최근 저점 이탈 시 기존 반등 가정 무효",
  },
  {
    key: "freeNote",
    label: "메모",
    helper: "선택 사항",
    example: "추가로 기억할 판단이나 조건을 기록하세요. (선택)",
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
          payload.side === "SELL" || item.title.includes("SELL")
            ? "SELL"
            : "BUY",
        label: linked
          ? `계획 연결${manualCount ? ` · 추가 근거 ${manualCount}개` : ""}`
          : "계획 없이 거래",
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
    .filter((item) => item.reasons.length > 0 || item.scenarioId != null);
}

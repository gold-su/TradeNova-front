import type {
  ReportDocumentResponse,
  TrainingEventResponse,
} from "@/types/training";

export const SCENARIO_FIELDS = [
  {
    key: "thesis",
    label: "현재 판단",
    helper: "지금 차트에서 가장 중요하게 보고 있는 흐름이나 신호는 무엇인가요?",
    example: "예: 저점이 높아지고 있지만 거래량이 약해 반등 확인이 더 필요함",
  },
  {
    key: "entryReason",
    label: "진입 기준",
    helper: "어떤 조건이 충족되면 매수할 생각인가요?",
    example: "예: 최근 고점 돌파와 함께 거래량이 최근 평균보다 뚜렷하게 증가할 때",
  },
  {
    key: "exitPlan",
    label: "리스크·청산 기준",
    helper: "판단이 틀렸다고 볼 조건과 이익을 실현할 조건은 무엇인가요?",
    example: "예: 최근 저점 이탈 시 손절, 이전 고점 부근에서 일부 익절",
  },
  {
    key: "riskNote",
    label: "계획 변경 조건",
    helper: "어떤 변화가 생기면 지금 계획을 다시 검토할 건가요?",
    example: "예: 돌파 후 다시 박스권 안으로 내려오면 기존 상승 가정 재검토",
  },
  {
    key: "freeNote",
    label: "메모",
    helper: "추가로 기억할 판단 근거나 조건을 기록하세요. (선택)",
    example: "추가로 기억할 판단 근거나 조건을 기록하세요. (선택)",
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

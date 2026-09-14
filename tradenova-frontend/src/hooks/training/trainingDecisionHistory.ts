import type {
  ReportDocumentResponse,
  TrainingEventResponse,
} from "@/types/training";

export const SCENARIO_FIELDS = [
  {
    key: "thesis",
    label: "관점",
    example: "예: 거래량이 증가하며 단기 추세 전환을 기대",
  },
  {
    key: "entryReason",
    label: "진입 조건",
    example: "예: 전고점 돌파와 거래량 증가 확인 시 진입",
  },
  {
    key: "exitPlan",
    label: "청산 계획",
    example: "예: 목표 구간 도달 시 일부 청산",
  },
  {
    key: "riskNote",
    label: "무효화",
    example: "예: 최근 저점 이탈 시 기존 가정 무효",
  },
  {
    key: "freeNote",
    label: "자유 메모",
    example: "추가로 기억할 내용을 기록하세요. (선택)",
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
          ? `현재 계획 사용${manualCount ? ` · 추가 근거 ${manualCount}개` : ""}`
          : "수동 근거",
        reasons,
      };
    })
    .filter(
      (item) =>
        item.reasons.length > 0 || item.label.startsWith("현재 계획 사용"),
    );
}

import type {
  ProgressResponse,
  ReportDraftContent,
  TrainingStatus,
} from "@/types/training";

/**
 * progress 응답이 아직 없는 차트의 기본 진행 상태를 만든다.
 * 주로 hydrate 직후, 혹은 거래 응답만 있고 progress 응답이 아직 없을 때 사용한다.
 */
export function emptyProgress(
  chartId: number,
  chartStatus: TrainingStatus,
  sessionStatus: TrainingStatus,
  price = 0,
): ProgressResponse {
  return {
    chartId,

    progressIndex: 0,
    maxIndex: 0,
    remainingBars: 0,
    atLastBar: false,

    currentPrice: price,

    chartStatus,
    sessionStatus,

    cashBalance: 0,
    positionQty: 0,
    avgPrice: 0,

    autoExited: false,
    reason: null,
    revealedCandles: [],
  };
}

/**
 * 리포트 draft 기본값
 * 활성 차트가 없거나 draft가 없을 때 초기 상태로 사용한다.
 */
export const emptyDraft: ReportDraftContent = {
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
  tags: [],
};

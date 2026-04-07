import type {
  Candle,
  ProgressResponse,
  TrainingStatus,
} from "@/types/training";

/**
 * 훈련 화면의 보기 모드
 * - grid: 4차트 그리드
 * - single: 단일 차트 집중 보기
 */
export type ViewMode = "grid" | "single";

/**
 * chartId 기준 캔들 맵
 * 예:
 * {
 *   101: Candle[],
 *   102: Candle[]
 * }
 */
export type CandlesMap = Record<number, Candle[]>;

/**
 * chartId 기준 진행 상태 맵
 * 예:
 * {
 *   101: ProgressResponse,
 *   102: ProgressResponse
 * }
 */
export type ProgressMap = Record<number, ProgressResponse>;

/**
 * 모의투자 계좌 DTO
 * /api/paper-accounts 응답용
 */
export type PaperAccountDto = {
  id: number;
  name: string;
  description?: string | null;
  cashBalance: number;
  isDefault?: boolean;
};

/**
 * 거래 모달 입력값
 */
export type TradeForm = {
  qty: number;
  entryReason: string;
  riskNote: string;
};

/**
 * 세션 hydrate용 최소 입력 타입
 * - 새 세션 생성 응답
 * - active session 복구 응답
 * 둘 다 여기로 맞춰서 처리
 */
export type HydrateSessionInput = {
  sessionId: number;
  accountId?: number;
  status: TrainingStatus;
  charts: {
    chartId: number;
    chartIndex: number;
    symbolId: number;
    symbolTicker: string;
    symbolName: string;
    bars: number;
    progressIndex: number;
    startDate: string;
    endDate: string;
    status: TrainingStatus;
  }[];
};

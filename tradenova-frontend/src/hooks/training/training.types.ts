import type {
  Candle,
  ProgressResponse,
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";

/**
 * 훈련 화면의 보기 모드
 * - grid: 멀티 차트를 동시에 보는 모드
 * - single: 한 차트에 집중해서 보는 모드
 */
export type ViewMode = "grid" | "single";

/**
 * chartId -> Candle[] 매핑
 * 예:
 * {
 *   101: [...],
 *   102: [...]
 * }
 */
export type CandlesMap = Record<number, Candle[]>;

/**
 * chartId -> ProgressResponse 매핑
 * 차트별 현재 진행 상황을 저장한다.
 */
export type ProgressMap = Record<number, ProgressResponse>;

/**
 * 모의투자 계좌 목록 조회용 DTO
 * /api/paper-accounts 응답을 프론트에서 간단히 쓰기 위한 타입
 */
export type PaperAccountDto = {
  id: number;
  name: string;
  initialBalance: number;
  cashBalance: number;
  description?: string | null;
  isDefault?: boolean;
};


export type TradeReasonItem = {
  id: string;
  title: string;
  entryReason: string;
  riskNote: string;
  createdAt: string;
};

/**
 * 매수/매도 모달 입력 폼 상태
 */
export type TradeForm = {
  qty: number;
  entryReason: string;
  riskNote: string;
  reasons: TradeReasonItem[];
};

/**
 * 새 세션 생성 응답 / active session 복구 응답을
 * 하나의 형태로 받아서 화면 상태를 복구하기 위한 타입
 */
export type HydrateSessionInput = {
  sessionId: number;
  accountId?: number;
  status: TrainingStatus;
  charts: TrainingChartDto[];
};

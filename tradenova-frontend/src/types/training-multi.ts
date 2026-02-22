// 멀티차트 기준(= chartId 1급 시민)

export type TrainingMode = "RANDOM" | "MANUAL";
export type TrainingStatus = "IN_PROGRESS" | "COMPLETED";
export type AutoExitReason = "STOP_LOSS" | "TAKE_PROFIT";

export type CandleDto = {
  idx?: number; // 백엔드가 주면 쓰고, 없으면 생략 가능
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

// ========== Session / Chart DTO ==========

export type TrainingChartDto = {
  chartId: number;
  chartIndex: number; // 0..3
  accountId: number;
  symbolId: number;
  symbolTicker: string;
  symbolName: string;
  bars: number;
  progressIndex: number;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  status: TrainingStatus;
};

export type CreateSessionRequest = {
  accountId: number;
  mode: TrainingMode;
  bars: number; // >= 30
  // (추후) chartCount/seed/charts[] 확장 가능
};

// 백엔드 현재 응답: sessionId + chartId(단일)만 주는지,
// 혹은 charts[] 주는지에 따라 유연하게 받기 위해 두 케이스 모두 허용
export type CreateSessionResponse =
  | {
      sessionId: number;
      chartId: number;
      chartIndex: number;
      accountId: number;
      symbolId: number;
      symbolTicker: string;
      symbolName: string;
      mode: TrainingMode;
      bars: number;
      progressIndex: number;
      startDate: string;
      endDate: string;
      status: TrainingStatus;
    }
  | {
      sessionId: number;
      status: TrainingStatus;
      charts: TrainingChartDto[];
    };

// ========== Progress / Trade / RiskRule ==========

export type ProgressResponse = {
  chartId: number;
  progressIndex: number;
  currentPrice: number;
  status: TrainingStatus;
  cashBalance: number;
  positionQty: number;
  avgPrice: number;
  autoExited: boolean;
  reason: AutoExitReason | null;
};

export type AdvanceRequest = { steps: number };

export type TradeRequest = { qty: number };

export type TradeResponse = {
  chartId: number;
  tradeId: number;
  cashBalance: number;
  positionQty: number;
  avgPrice: number;
  executedPrice: number;
};

export type RiskRuleUpsertRequest = {
  stopLossPrice: number | null;
  takeProfitPrice: number | null;
  autoExitEnabled: boolean;
};

export type RiskRuleResponse = {
  id: number;
  chartId: number;
  accountId: number;
  stopLossPrice: number | null;
  takeProfitPrice: number | null;
  autoExitEnabled: boolean;
  updatedAt: string;
};

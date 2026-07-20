// src/types/training.ts

// ===== Enums =====
export type TrainingMode = "RANDOM" | "MANUAL";
export type TrainingStatus = "IN_PROGRESS" | "COMPLETED";
export type AutoExitReason = "STOP_LOSS" | "TAKE_PROFIT";

export type EventType =
  | "PROGRESS"
  | "TRADE"
  | "WARNING"
  | "NOTE"
  | "SNAPSHOT"
  | "AI";

export type ReportKind = "DRAFT" | "SNAPSHOT";

// ===== Candle =====
// 백엔드 candle: t는 epoch millis
// 프론트 차트에서는 필요하면 /1000 해서 sec로 변환
export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

// ===== Chart / Session =====
export type TrainingChartDto = {
  chartId: number;
  chartIndex: number;
  symbolId: number;
  symbolTicker: string;
  symbolName: string;
  trainingSector: string;
  bars: number;
  progressIndex: number;
  status: "IN_PROGRESS" | "COMPLETED";
  startDate: string;
  endDate: string;
};


export type CreateSessionRequest = {
  accountId: number;
  mode: TrainingMode;
  bars: number;
  chartCount?: number;
};

export type CreateSessionResponse = {
  sessionId: number;
  accountId: number;
  mode: TrainingMode;
  status: TrainingStatus;
  charts: TrainingChartDto[];
};

export type SessionDetailResponse = {
  sessionId: number;
  accountId: number;
  mode: TrainingMode;
  status: TrainingStatus;
};

export type AdvanceRequest = {
  steps: number;
};

export type ProgressResponse = {
  chartId: number;
  progressIndex: number;

  maxIndex: number;
  remainingBars: number;
  atLastBar: boolean;

  currentPrice: number;

  chartStatus: "IN_PROGRESS" | "COMPLETED";
  sessionStatus: "IN_PROGRESS" | "COMPLETED";

  cashBalance: number;
  positionQty: number;
  avgPrice: number;

  autoExited: boolean;
  reason: AutoExitReason | null;
};

// ===== Trade =====
export type TradeRequest = {
  qty: number;
};

export type TradeResponse = {
  chartId: number;
  tradeId: number;
  cashBalance: number;
  positionQty: number;
  avgPrice: number;
  executedPrice: number;
  candleTime: number;
};

export type TrainingTradeItemResponse = {
  tradeId: number;
  chartId: number;
  accountId: number;
  symbolId: number;
  side: "BUY" | "SELL";
  price: number;
  qty: number;
  createdAt: string;
  candleTime: number;
};

/**
 * 세션 종료 후 완료 화면에 표시할 요약 응답
 *
 * GET /api/training/sessions/{sessionId}/summary
 */
export type SessionSummaryResponse = {
  sessionId: number;
  status: TrainingStatus;

  totalChartCount: number;
  completedChartCount: number;

  tradeCount: number;
  snapshotCount: number;

  sessionAiExists: boolean;
  sessionAiScore: number | null;
};

// ===== Risk Rule =====
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

// ===== Quick Phrase =====
export type QuickPhraseCreateRequest = {
  title: string;
  content: string;
};

export type QuickPhraseUpdateRequest = {
  title: string;
  content: string;
};

export type QuickPhraseResponse = {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
};

// ===== Report =====
export type ReportDraftContent = {
  thesis?: string;
  entryReason?: string;
  exitPlan?: string;
  riskNote?: string;
  freeNote?: string;
  tags?: string[];
};

export type ReportDraftUpsertRequest = {
  contentJson: ReportDraftContent;
};

export type ReportSnapshotCreateRequest = {
  linkedEventId?: number | null;
  contentJson: ReportDraftContent;
};

export type ReportDocumentResponse = {
  id: number;
  chartId: number;
  kind: ReportKind;
  contentJson: ReportDraftContent;
  createdAt: string;
  updatedAt: string | null;
};

// ===== Training Event =====
export type TrainingEventAppendRequest = {
  type?: EventType | null;
  title: string;
  payloadJson?: Record<string, unknown> | null;
};

export type TrainingEventResponse = {
  id: number;
  chartId: number;
  type: EventType;
  title: string;
  payloadJson?: Record<string, unknown> | null;
  createdAt: string;
};

// ===== AI Review =====
export type AiReviewPayload = {
  score: number;
  summary: string;
  warnings: string[];
  strengths: string[];
  snapshotId?: number;
  chartId?: number;
};

export type ActiveTrainingSessionResponse = {
  sessionId: number;
  accountId: number;
  mode: TrainingMode;
  status: TrainingStatus;
  totalChartCount: number;
  completedChartCount: number;
  charts: TrainingChartDto[];
};

export type ChartAiPayload = {
  analysisScope: "CHART";
  analysisType: "FAST" | "DEEP";
  hasSnapshot: boolean;
  score: number;
  summary: string;
  generatedAt: string;
  analysisVersion: number;
  warnings: string[];
  strengths: string[];
  snapshotId?: number | null;
  chartId?: number;
  stopLossPrice?: string | null;
  takeProfitPrice?: string | null;
  autoExitEnabled?: boolean;
};

export type SessionFinishResponse = {
  sessionId: number;
  sessionStatus: TrainingStatus;
  totalChartCount: number;
  completedChartCount: number;
  forceCompletedChartCount: number;
};

export type SessionAiPayload = {
  analysisScope: "SESSION";
  sessionId: number;
  score: number;
  summary: string;
  generatedAt: string;
  analysisVersion: number;
  hasSnapshots: boolean;
  tradedChartCount: number;
  totalChartCount: number;
  completedChartCount: number;
  totalTradeCount: number;
  totalEventCount: number;
  snapshotCount: number;
  warnings: string[];
  strengths: string[];
};

export type SessionSummaryResponse = {
  sessionId: number;
  status: TrainingStatus;
  totalChartCount: number;
  completedChartCount: number;
  tradeCount: number;
  snapshotCount: number;
  sessionAiExists: boolean;
  sessionAiScore: number | null;
};



export type ChartRefreshType =
  | "RANDOM"
  | "TRAINING_SECTOR"
  | "EXCHANGE_SECTOR"
  | "TOP_VOLUME"
  | "ORDER_FLOW"
  | "THEME";

export type TrainingSector =
  | "SEMICONDUCTOR"
  | "SECONDARY_BATTERY"
  | "PLATFORM"
  | "BIO"
  | "FINANCE"
  | "DEFENSE"
  | "SHIPBUILDING";

export type ChartRefreshRequest = {
  refreshType: ChartRefreshType;
  optionValue: string | null;
};

export type MaType = "SMA" | "WMA" | "EMA";

export type MaLineSetting = {
  period: number;
  color: string;
  width: number;
};

export type BollingerSettings = {
  enabled: boolean;
  period: number;
  multiplier: number;

  upperColor: string;
  middleColor: string;
  lowerColor: string;

  upperWidth: number;
  middleWidth: number;
  lowerWidth: number;
};

export type IndicatorSettings = {
  volume: {
    enabled: boolean;
  };

  ma: {
    enabled: boolean;
    type: MaType;
    lines: MaLineSetting[];
  };

  bollinger: BollingerSettings;

  ichimoku: {
    enabled: boolean;
    disabled: boolean;
  };

  volumeProfile: {
    enabled: boolean;
    disabled: boolean;
  };

  rsi: {
    enabled: boolean;
    disabled?: boolean;
    period: number;
    upper: number;
    lower: number;
    color: string;
    upperColor: string;
    lowerColor: string;
  };

  macd: {
    enabled: boolean;
    disabled?: boolean;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
    macdColor: string;
    signalColor: string;
    histogramUpColor: string;
    histogramDownColor: string;
  };
};
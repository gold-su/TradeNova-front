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
  bars: number;
  progressIndex: number;
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
  currentPrice: number;
  status: TrainingStatus;
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
  status: TrainingStatus | string;
  totalChartCount: number;
  completedChartCount: number;
  forceCompletedCount: number;
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

export type ChartRefreshType = "RANDOM" | "TRAINING_SECTOR" | "EXCHANGE_SECTOR";

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

export type MaLineSetting = {
  period: number;
  color: string;
  width: number;
};

export type IndicatorSettings = {
  volume: {
    enabled: boolean;
  };
  ma: {
    enabled: boolean;
    lines: MaLineSetting[];
  };
  bollinger: {
    enabled: boolean;
    disabled: boolean;
  };
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
    disabled: boolean;
  };
  macd: {
    enabled: boolean;
    disabled: boolean;
  };
};
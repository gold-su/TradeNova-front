// src/types/training.ts

// ===== Enums =====
export type TrainingMode = "RANDOM" | "MANUAL";
export type TrainingStatus = "IN_PROGRESS" | "COMPLETED";
export type AutoExitReason = "STOP_LOSS" | "TAKE_PROFIT";

// ===== Candle =====
// 백엔드 candle: t는 epoch millis (프론트 chart에서 /1000 해서 sec 사용)
export type Candle = {
    t: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
};

// ===== Chart DTO =====
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
    endDate: string;   // yyyy-MM-dd
    status: TrainingStatus;
};

// ===== Session Create =====
export type CreateSessionRequest = {
    accountId: number;
    mode: TrainingMode;
    bars: number;        // >= 30
    chartCount?: number; // 1 or 4 (optional)
};

// 백엔드 응답이 단일/멀티 둘 다 가능하면 유니온 유지
export type CreateSessionResponse =
    | {
        sessionId: number;
        status: TrainingStatus;
        charts: TrainingChartDto[];
    }
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
    };

// ===== Progress =====
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

// ===== Trade =====
export type TradeRequest = { qty: number };

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
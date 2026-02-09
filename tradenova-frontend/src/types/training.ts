//백엔드 enum 값을 문자열 유니온 타입으로 표현
//아무 문자열이나 못 넣게 막음
export type TrainingMode = "RANDOM" | "MANUAL";
export type TrainingStatus = "IN_PROGRESS" | "COMPLETED";
export type AutoExitReason = "STOP_LOSS" | "TAKE_PROFIT";
//캔들 구조
export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
//세션 생성 요청 DTO
//프론트->백엔드로 보내는 데이터
//검증 규칙 (bras >= 30)은 서버에서 실제로 체크
export type TrainingSessionCreateRequest = {
    accountId: number;
    mode: TrainingMode;
    bars: number; // >= 30
};
//세션 생성 응답 DTO
export type TrainingSessionCreateResponse = {
    sessionId: number;
    accountId: number;
    symbolId: number;
    symbolTicker: string;
    symbolName: string;
    mode: TrainingMode;
    bars: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    status: TrainingStatus;
};
//세션 진행 응답 DTO
export type SessionProgressResponse = {
    sessionId: number;
    progressIndex: number;
    currentPrice: number;
    status: TrainingStatus;
    cashBalance: number;
    positionQty: number;
    avgPrice: number;
    autoExited: boolean;
    reason: AutoExitReason | null;
};
//매매 요청 DTO
export type TradeRequest = { qty: number };
//매매 응답 DTO
export type TradeResponse = {
    sessionId: number;
    tradeId: number;
    cashBalance: number;
    positionQty: number;
    avgPrice: number;
    executedPrice: number;
};
//리스크룰 Upsert 요청 DTO
export type RiskRuleUpsertRequest = {
    stopLossPrice: number | null;
    takeProfitPrice: number | null;
    autoExitEnabled: boolean;
};
//리스크룰 응답 DTO
export type RiskRuleResponse = {
    id: number;
    sessionId: number;
    accountId: number;
    stopLossPrice: number | null;
    takeProfitPrice: number | null;
    autoExitEnabled: boolean;
    updatedAt: string;
};
import http from "./http";
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  Candle,
  ProgressResponse,
  AdvanceRequest,
  TradeRequest,
  TradeResponse,
  RiskRuleUpsertRequest,
  RiskRuleResponse,
  ActiveTrainingSessionResponse,
  SessionFinishResponse,
  ChartRefreshRequest,
  TrainingTradeItemResponse,
  SessionSummaryResponse,
  TrainingChartDto,
} from "@/types/training";

export const trainingApi = {
  // ===== Session =====
  createSession: (body: CreateSessionRequest) =>
    http
      .post<CreateSessionResponse>("/api/training/sessions", body)
      .then((r) => r.data),

  getSessionCharts: (sessionId: number) =>
    http
      .get<TrainingChartDto[]>(
        `/api/training/sessions/${sessionId}/charts`,
      )
      .then((r) => r.data),

  getActiveSession: () =>
    http
      .get<ActiveTrainingSessionResponse | null>(
        "/api/training/sessions/active",
      )
      .then((r) => r.data),

  finishSession: (sessionId: number) =>
    http
      .post<SessionFinishResponse>(
        `/api/training/sessions/${sessionId}/finish`,
      )
      .then((r) => r.data),

  getSessionSummary: (sessionId: number) =>
    http
      .get<SessionSummaryResponse>(
        `/api/training/sessions/${sessionId}/summary`,
      )
      .then((r) => r.data),

  // ===== Candles =====
  getChartCandles: (chartId: number) =>
    http
      .get<Candle[]>(`/api/training/charts/${chartId}/candles`)
      .then((r) => r.data),

  // ===== Progress =====
  getProgress: (chartId: number) =>
    http
      .get<ProgressResponse>(
        `/api/training/charts/${chartId}/progress`,
      )
      .then((r) => r.data),

  next: (chartId: number) =>
    http
      .post<ProgressResponse>(
        `/api/training/charts/${chartId}/next`,
      )
      .then((r) => r.data),

  advance: (chartId: number, body: AdvanceRequest) =>
    http
      .post<ProgressResponse>(
        `/api/training/charts/${chartId}/advance`,
        body,
      )
      .then((r) => r.data),

  // ===== Trade =====
  buy: (chartId: number, body: TradeRequest) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/buy`,
        body,
      )
      .then((r) => r.data),

  sell: (chartId: number, body: TradeRequest) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/sell`,
        body,
      )
      .then((r) => r.data),

  sellAll: (chartId: number) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/sell-all`,
      )
      .then((r) => r.data),

  getTrades: (chartId: number) =>
    http
      .get<TrainingTradeItemResponse[]>(
        `/api/training/charts/${chartId}/trades`,
      )
      .then((r) => r.data),

  // ===== Risk Rule =====
  getRiskRule: (chartId: number) =>
    http
      .get<RiskRuleResponse>(
        `/api/training/charts/${chartId}/risk-rule`,
      )
      .then((r) => r.data),

  upsertRiskRule: (
    chartId: number,
    body: RiskRuleUpsertRequest,
  ) =>
    http
      .put<RiskRuleResponse>(
        `/api/training/charts/${chartId}/risk-rule`,
        body,
      )
      .then((r) => r.data),

  // ===== Chart Refresh =====
  refreshChart: (
    chartId: number,
    body: ChartRefreshRequest,
  ) =>
    http
      .post<TrainingChartDto>(
        `/api/training/sessions/charts/${chartId}/refresh`,
        body,
      )
      .then((r) => r.data),
};
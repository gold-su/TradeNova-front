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
} from "@/types/training";

export const trainingApi = {
  // ===== Session =====
  createSession: (body: CreateSessionRequest) =>
    http
      .post<CreateSessionResponse>("/api/training/sessions", body)
      .then((r) => r.data),

  getSessionCharts: (sessionId: number) =>
    http
      .get(`/api/training/sessions/${sessionId}/charts`)
      .then((r) => r.data),

  // ===== Candles =====
  getChartCandles: (chartId: number) =>
    http
      .get<Candle[]>(`/api/training/charts/${chartId}/candles`)
      .then((r) => r.data),

  // ===== Progress =====
  next: (chartId: number) =>
    http
      .post<ProgressResponse>(`/api/training/charts/${chartId}/next`)
      .then((r) => r.data),

  advance: (chartId: number, body: AdvanceRequest) =>
    http
      .post<ProgressResponse>(
        `/api/training/charts/${chartId}/advance`,
        body
      )
      .then((r) => r.data),

  // ===== Trade =====
  buy: (chartId: number, body: TradeRequest) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/buy`,
        body
      )
      .then((r) => r.data),

  sell: (chartId: number, body: TradeRequest) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/sell`,
        body
      )
      .then((r) => r.data),

  sellAll: (chartId: number) =>
    http
      .post<TradeResponse>(
        `/api/training/charts/${chartId}/trades/sell-all`
      )
      .then((r) => r.data),

  // ===== Risk Rule =====
  getRiskRule: (chartId: number) =>
    http
      .get<RiskRuleResponse>(
        `/api/training/charts/${chartId}/risk-rule`
      )
      .then((r) => r.data),

  upsertRiskRule: (chartId: number, body: RiskRuleUpsertRequest) =>
    http
      .put<RiskRuleResponse>(
        `/api/training/charts/${chartId}/risk-rule`,
        body
      )
      .then((r) => r.data),
};
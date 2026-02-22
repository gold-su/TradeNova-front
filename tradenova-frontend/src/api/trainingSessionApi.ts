/**
 * @deprecated 멀티차트 리팩토링으로 폐기 예정.
 * chartId 기준 API는 src/api/trainingApi.ts 를 사용하세요.
 */

import http from "./http"; //axios 인스턴스 임, baseURL, Authorization: Bearer ... 같은 공통 설정이 들어가 있음.
//백엔드 DTO랑 1:1로 맞추는 프론트 타입들.
//요청 body에 어떤 필드가 있어야 하는지, 응답에 뭐가 오는지를 TS가 잡아줘서 실수 줄어듦.
import type {
  TrainingSessionCreateRequest,
  TrainingSessionCreateResponse,
  SessionProgressResponse,
  TradeRequest,
  TradeResponse,
  RiskRuleUpsertRequest,
  RiskRuleResponse,
  Candle,
} from "@/types/training";

//함수 묶음 객체
//각 키가 'API 1개'라고 보면 됨.
//페이지 사용 예시 : const res = await trainingSessionApi.createSession(body);
//GET : body 없음 / 응답 타입만 지정
//POST/PUT : body 있음(또는 없을 수도) / 응답 타입 지정
//.then(r => r.data) 이유 : axios 응답은 { data, status, headers... } 구조인데 우리는 보통 data만 필요해서 data만 뽑아 반환하는 패턴.
export const trainingSessionApi = {
  //세션 생성
  createSession: (body: TrainingSessionCreateRequest) =>
    http
      .post<TrainingSessionCreateResponse>("/api/training/sessions", body)
      .then((r) => r.data),
  //세션 캔들 조회
  getSessionCandles: (sessionId: number) =>
    http
      .get<Candle[]>(`/api/training/sessions/${sessionId}/candles`)
      .then((r) => r.data),
  //다음 봉(1봉 진행)
  next: (sessionId: number) =>
    http
      .post<SessionProgressResponse>(`/api/training/sessions/${sessionId}/next`)
      .then((r) => r.data),
  //N봉 진행
  advance: (sessionId: number, steps: number) =>
    http
      .post<SessionProgressResponse>(
        `/api/training/sessions/${sessionId}/advance`,
        { steps },
      )
      .then((r) => r.data),
  //매수
  buy: (sessionId: number, qty: number) =>
    http
      .post<TradeResponse>(`/api/training/sessions/${sessionId}/trades/buy`, {
        qty,
      } satisfies TradeRequest)
      .then((r) => r.data),
  //매도
  sell: (sessionId: number, qty: number) =>
    http
      .post<TradeResponse>(`/api/training/sessions/${sessionId}/trades/sell`, {
        qty,
      } satisfies TradeRequest)
      .then((r) => r.data),
  //전량 매도
  sellAll: (sessionId: number) =>
    http
      .post<TradeResponse>(
        `/api/training/sessions/${sessionId}/trades/sell-all`,
      )
      .then((r) => r.data),
  //리스크룰 조회
  getRiskRule: (sessionId: number) =>
    http
      .get<RiskRuleResponse>(`/api/training/sessions/${sessionId}/risk-rule`)
      .then((r) => r.data),
  //리스크룰 업서트(없으면 생성, 있으면 수정)
  upsertRiskRule: (sessionId: number, body: RiskRuleUpsertRequest) =>
    http
      .put<RiskRuleResponse>(
        `/api/training/sessions/${sessionId}/risk-rule`,
        body,
      )
      .then((r) => r.data),
};

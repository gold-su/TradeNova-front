import type { TrainingHistorySummaryResponse } from "@/types/training";

export type HistorySort = "LATEST" | "OLDEST" | "SCORE_HIGH" | "SCORE_LOW" | "TRADES_HIGH" | "TRADES_LOW";
export type AiReviewFilter = "ALL" | "WITH_REVIEW" | "WITHOUT_REVIEW";
export type TradeFilter = "ALL" | "WITH_TRADES" | "WITHOUT_TRADES";

export function trainingHistoryDetailPath(sessionId: number) { return `/mypage/history/${sessionId}`; }

export function filterAndSortHistory(items: TrainingHistorySummaryResponse[], sort: HistorySort, aiFilter: AiReviewFilter, tradeFilter: TradeFilter) {
  const filtered = items.filter((item) => (aiFilter === "ALL" || (aiFilter === "WITH_REVIEW" ? item.hasSessionAiReview : !item.hasSessionAiReview)) && (tradeFilter === "ALL" || (tradeFilter === "WITH_TRADES" ? item.totalTradeCount > 0 : item.totalTradeCount === 0)));
  return [...filtered].sort((a, b) => {
    if (sort === "LATEST" || sort === "OLDEST") {
      const difference = historyTimestamp(a) - historyTimestamp(b);
      return sort === "LATEST" ? -difference : difference;
    }
    if (sort === "TRADES_HIGH" || sort === "TRADES_LOW") return sort === "TRADES_HIGH" ? b.totalTradeCount - a.totalTradeCount : a.totalTradeCount - b.totalTradeCount;
    const aScore = a.hasSessionAiReview ? a.sessionAiScore : null;
    const bScore = b.hasSessionAiReview ? b.sessionAiScore : null;
    if (aScore === null && bScore === null) return historyTimestamp(b) - historyTimestamp(a);
    if (aScore === null) return 1;
    if (bScore === null) return -1;
    return sort === "SCORE_HIGH" ? bScore - aScore : aScore - bScore;
  });
}

export function groupHistoryByMonth(items: TrainingHistorySummaryResponse[]) {
  const groups = new Map<string, TrainingHistorySummaryResponse[]>();
  for (const item of items) {
    const date = new Date(item.completedAt ?? item.createdAt);
    const key = Number.isNaN(date.getTime()) ? "날짜 미상" : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit" }).format(date);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([label, sessions]) => ({ label, sessions }));
}

export function formatHistoryDate(value: string | null) {
  if (!value) return "완료 시각 없음";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "완료 시각 없음" : new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function historyTimestamp(item: TrainingHistorySummaryResponse) {
  const timestamp = new Date(item.completedAt ?? item.createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

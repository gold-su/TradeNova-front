import assert from "node:assert/strict";
import test from "node:test";
import type { TrainingHistorySummaryResponse } from "../src/types/training.ts";
import { filterAndSortHistory, trainingHistoryDetailPath } from "../src/pages/mypage/trainingHistoryBrowser.ts";

function item(sessionId: number, completedAt: string, trades: number, score: number | null): TrainingHistorySummaryResponse {
  return { sessionId, status: "COMPLETED", createdAt: completedAt, completedAt, totalChartCount: 4, completedChartCount: 4, totalTradeCount: trades, snapshotCount: 0, hasSessionAiReview: score !== null, sessionAiScore: score };
}

const items = [item(1, "2026-09-01T00:00:00Z", 2, 70), item(2, "2026-09-03T00:00:00Z", 0, null), item(3, "2026-09-02T00:00:00Z", 5, 40)];

test("history rows share the dedicated detail route", () => {
  assert.equal(trainingHistoryDetailPath(131), "/mypage/history/131");
});

test("history sorting retains date, score and trade ordering semantics", () => {
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "ALL", "ALL").map(({ sessionId }) => sessionId), [2, 3, 1]);
  assert.deepEqual(filterAndSortHistory(items, "OLDEST", "ALL", "ALL").map(({ sessionId }) => sessionId), [1, 3, 2]);
  assert.deepEqual(filterAndSortHistory(items, "SCORE_HIGH", "ALL", "ALL").map(({ sessionId }) => sessionId), [1, 3, 2]);
  assert.deepEqual(filterAndSortHistory(items, "SCORE_LOW", "ALL", "ALL").map(({ sessionId }) => sessionId), [3, 1, 2]);
  assert.deepEqual(filterAndSortHistory(items, "TRADES_HIGH", "ALL", "ALL").map(({ sessionId }) => sessionId), [3, 1, 2]);
});

test("history filters review and trade availability", () => {
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "WITH_REVIEW", "ALL").map(({ sessionId }) => sessionId), [3, 1]);
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "WITHOUT_REVIEW", "ALL").map(({ sessionId }) => sessionId), [2]);
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "ALL", "WITHOUT_TRADES").map(({ sessionId }) => sessionId), [2]);
});

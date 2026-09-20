import assert from "node:assert/strict";
import test from "node:test";
import { parseChartAiPayload, parseSessionAiPayload } from "../src/components/training/ai/aiReviewPayload.ts";
import { filterAndSortHistory, groupHistoryByMonth } from "../src/pages/mypage/trainingHistoryBrowser.ts";
import type { TrainingHistorySummaryResponse } from "../src/types/training.ts";

function session(id: number, completedAt: string, score: number | null, trades: number): TrainingHistorySummaryResponse {
  return { sessionId: id, status: "COMPLETED", createdAt: completedAt, completedAt, totalChartCount: 4, completedChartCount: 4, totalTradeCount: trades, snapshotCount: id, hasSessionAiReview: score !== null, sessionAiScore: score };
}

const items = [session(1, "2026-08-10T00:00:00Z", 80, 2), session(2, "2026-09-20T00:00:00Z", null, 0), session(3, "2026-09-10T00:00:00Z", 40, 5)];

test("history supports latest and oldest sorting", () => {
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "ALL", "ALL").map((item) => item.sessionId), [2, 3, 1]);
  assert.deepEqual(filterAndSortHistory(items, "OLDEST", "ALL", "ALL").map((item) => item.sessionId), [1, 3, 2]);
});

test("score sorting always places sessions without a score last", () => {
  assert.deepEqual(filterAndSortHistory(items, "SCORE_HIGH", "ALL", "ALL").map((item) => item.sessionId), [1, 3, 2]);
  assert.deepEqual(filterAndSortHistory(items, "SCORE_LOW", "ALL", "ALL").map((item) => item.sessionId), [3, 1, 2]);
});

test("trade sorting and review/trade filters are deterministic", () => {
  assert.deepEqual(filterAndSortHistory(items, "TRADES_HIGH", "ALL", "ALL").map((item) => item.sessionId), [3, 1, 2]);
  assert.deepEqual(filterAndSortHistory(items, "TRADES_LOW", "ALL", "ALL").map((item) => item.sessionId), [2, 1, 3]);
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "WITH_REVIEW", "WITH_TRADES").map((item) => item.sessionId), [3, 1]);
  assert.deepEqual(filterAndSortHistory(items, "LATEST", "WITHOUT_REVIEW", "WITHOUT_TRADES").map((item) => item.sessionId), [2]);
  assert.equal(filterAndSortHistory(items, "LATEST", "WITHOUT_REVIEW", "WITH_TRADES").length, 0);
});

test("history groups the currently sorted result by month", () => {
  assert.deepEqual(groupHistoryByMonth(filterAndSortHistory(items, "LATEST", "ALL", "ALL")).map((group) => [group.label, group.sessions.map((item) => item.sessionId)]), [["2026. 9.", [2, 3]], ["2026. 8.", [1]]]);
});

test("saved Session and Chart AI payloads retain full review content", () => {
  const common = { score: 72, summary: "요약", strengths: ["강점"], warnings: ["주의"] };
  const chart = parseChartAiPayload({ ...common, analysisScope: "CHART", analysisType: "FAST", hasSnapshot: false, generatedAt: "now", analysisVersion: 1 });
  const sessionReview = parseSessionAiPayload({ ...common, analysisScope: "SESSION", sessionId: 9, generatedAt: "now", analysisVersion: 2, hasSnapshots: true, tradedChartCount: 1, totalChartCount: 1, completedChartCount: 1, totalTradeCount: 1, totalEventCount: 2, snapshotCount: 1, nextTrainingFocus: ["복습"] });
  assert.deepEqual(chart?.strengths, ["강점"]);
  assert.deepEqual(chart?.warnings, ["주의"]);
  assert.deepEqual(sessionReview?.nextTrainingFocus, ["복습"]);
  assert.equal(parseChartAiPayload({ score: 72 }), null);
});

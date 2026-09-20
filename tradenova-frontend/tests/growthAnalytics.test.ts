import assert from "node:assert/strict";
import test from "node:test";
import { buildScoreChart, scorePolyline } from "../src/pages/growth/growthChart.ts";
import { isNestedGrowthResponse, normalizeGrowthOverview, splitGrowthOverview } from "../src/pages/growth/growthView.ts";
import type { GrowthOverviewResponse, LegacyGrowthOverviewResponse } from "../src/types/training.ts";

test("growth score chart keeps chronological input order on a fixed 0-100 scale", () => {
  const points = buildScoreChart([
    { sessionId: 1, completedAt: "2026-01-01T00:00:00Z", score: 40 },
    { sessionId: 2, completedAt: "2026-01-02T00:00:00Z", score: 80 },
  ]);
  assert.equal(points[0].sessionId, 1);
  assert.ok(points[0].x < points[1].x);
  assert.ok(points[1].y < points[0].y);
  assert.equal(scorePolyline(points).split(" ").length, 2);
});

test("growth score chart handles missing and single-score trends", () => {
  assert.deepEqual(buildScoreChart([]), []);
  const [point] = buildScoreChart([{ sessionId: 1, completedAt: null, score: 75 }]);
  assert.equal(point.x, 380);
});

test("growth score chart clamps legacy scores to the visible process scale", () => {
  const [high, low] = buildScoreChart([
    { sessionId: 1, completedAt: null, score: 120 },
    { sessionId: 2, completedAt: null, score: -5 },
  ]);
  assert.ok(high.y < low.y);
});

test("period changes retain lifetime level while replacing metrics and trend", () => {
  const lifetime = { totalXp: 1300, level: 3, levelTitle: "Disciplined Trader", currentLevelXp: 300, nextLevelXp: 200, progressPercent: 60 };
  const metric = (numerator: number, denominator: number) => ({ numerator, denominator, rate: denominator ? numerator * 100 / denominator : 0 });
  const response = (key: "LAST_10" | "LAST_30", sessions: number, score: number): GrowthOverviewResponse => ({ lifetime, period: { key, limit: key === "LAST_10" ? 10 : 30, completedSessions: sessions, totalTrades: sessions * 2, planSessionRate: metric(sessions - 1, sessions), actionReasonRate: metric(sessions, sessions * 2), riskRuleSessionRate: metric(1, sessions), aiReviewSessionRate: metric(1, sessions), averageSessionAiScore: score, scoreTrend: [{ sessionId: sessions, completedAt: null, score }] } });
  const ten = splitGrowthOverview(response("LAST_10", 10, 40));
  const thirty = splitGrowthOverview(response("LAST_30", 30, 70));
  assert.deepEqual(ten.lifetime, thirty.lifetime);
  assert.notDeepEqual(ten.period.planSessionRate, thirty.period.planSessionRate);
  assert.notDeepEqual(ten.period.scoreTrend, thirty.period.scoreTrend);
});

test("nested lifetime and period response renders without normalization loss", () => {
  const metric = { numerator: 1, denominator: 2, rate: 50 };
  const nested: GrowthOverviewResponse = { lifetime: { totalXp: 800, level: 2, levelTitle: "Planner", currentLevelXp: 300, nextLevelXp: 200, progressPercent: 60 }, period: { key: "LAST_10", limit: 10, completedSessions: 10, totalTrades: 20, planSessionRate: metric, actionReasonRate: metric, riskRuleSessionRate: metric, aiReviewSessionRate: metric, averageSessionAiScore: null, scoreTrend: [] } };
  assert.equal(isNestedGrowthResponse(nested), true);
  assert.equal(normalizeGrowthOverview(nested).lifetime.level, 2);
  assert.equal(normalizeGrowthOverview(nested).period.planSessionRate.rate, 50);
  assert.equal(normalizeGrowthOverview(nested).period.averageSessionAiScore, null);
  assert.deepEqual(normalizeGrowthOverview(nested).period.scoreTrend, []);
});

test("legacy flat period response uses the unfiltered response for lifetime level", () => {
  const metric = { numerator: 1, denominator: 1, rate: 100 };
  const legacy = (period: "LAST_10" | "ALL", sessions: number, xp: number): LegacyGrowthOverviewResponse => ({ period, totalCompletedSessions: sessions, totalTrades: sessions * 2, totalXp: xp, level: Math.floor(xp / 500) + 1, levelTitle: "Planner", currentLevelXp: xp % 500, nextLevelXp: 500 - xp % 500, progressPercent: xp % 500 / 5, planSessionRate: metric, actionReasonRate: metric, riskRuleSessionRate: metric, aiReviewSessionRate: metric, averageSessionAiScore: 42, scoreTrend: [{ sessionId: 1, completedAt: null, score: 42 }] });
  const selected = legacy("LAST_10", 10, 1200);
  const all = legacy("ALL", 30, 3600);
  const normalized = normalizeGrowthOverview(selected, all);
  assert.equal(isNestedGrowthResponse(selected), false);
  assert.equal(normalized.lifetime.totalXp, 3600);
  assert.equal(normalized.lifetime.level, 8);
  assert.equal(normalized.period.completedSessions, 10);
  assert.equal(normalized.period.totalTrades, 20);
  assert.equal(normalized.period.scoreTrend.length, 1);
});

import assert from "node:assert/strict";
import test from "node:test";
import { buildScoreChart, scorePolyline } from "../src/pages/growth/growthChart.ts";

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

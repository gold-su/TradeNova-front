import assert from "node:assert/strict";
import test from "node:test";
import { parseChartAiPayload, parseSessionAiPayload } from "../src/components/training/ai/aiReviewPayload.ts";

test("saved session AI payload retains review content for history", () => {
  const payload = { analysisScope: "SESSION", sessionId: 9, score: 75, summary: "요약", strengths: ["계획 준수"], warnings: ["추격 매수"], decisionReview: { assessment: "좋음", evidence: ["근거"], betterAction: "유지" } };
  assert.deepEqual(parseSessionAiPayload(payload), payload);
});

test("saved chart AI payload retains review content for history", () => {
  const payload = { analysisScope: "CHART", analysisType: "DEEP", score: 62, summary: "차트 요약", strengths: ["손절 준수"], warnings: ["진입 지연"] };
  assert.deepEqual(parseChartAiPayload(payload), payload);
});

test("invalid saved AI payload is not presented as a review", () => {
  assert.equal(parseSessionAiPayload({ analysisScope: "SESSION", score: 10 }), null);
  assert.equal(parseChartAiPayload({ analysisScope: "CHART", score: 10 }), null);
});

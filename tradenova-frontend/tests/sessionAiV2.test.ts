import assert from "node:assert/strict";
import test from "node:test";
import {
  ACTIVE_AI_REVIEW_TARGETS,
  EXISTING_SESSION_AI_ACTION_LABEL,
  GENERATED_REVIEW_ACTION_LABEL,
  getSessionAiReviewVisibility,
} from "../src/components/training/ai/sessionAiReview.ts";
import type { SessionAiPayload } from "../src/types/training.ts";

const legacyPayload = {
  analysisScope: "SESSION",
  sessionId: 1,
  score: 72,
  summary: "기존 분석",
  generatedAt: "2026-09-12T00:00:00Z",
  analysisVersion: 1,
  hasSnapshots: false,
  tradedChartCount: 1,
  totalChartCount: 2,
  completedChartCount: 2,
  totalTradeCount: 1,
  totalEventCount: 1,
  snapshotCount: 0,
  warnings: ["경고"],
  strengths: ["강점"],
} satisfies SessionAiPayload;

test("legacy session AI remains valid and omits empty v2 sections", () => {
  assert.deepEqual(getSessionAiReviewVisibility(legacyPayload), {
    decisionReview: false,
    riskReview: false,
    behaviorPatterns: false,
    nextTrainingFocus: false,
  });
  assert.deepEqual(legacyPayload.warnings, ["경고"]);
  assert.deepEqual(legacyPayload.strengths, ["강점"]);
});

test("session AI v2 structured coaching sections are exposed for rendering", () => {
  const payload: SessionAiPayload = {
    ...legacyPayload,
    analysisVersion: 2,
    decisionReview: {
      assessment: "진입 판단 평가",
      evidence: ["가격 추격 진입"],
      betterAction: "확인 후 진입",
    },
    riskReview: {
      assessment: "손절 기준이 늦음",
      evidence: ["계획보다 늦게 청산"],
      improvement: "진입 전에 손절 설정",
    },
    behaviorPatterns: [{
      pattern: "추격 매수",
      evidence: ["상승 봉 직후 진입"],
      impact: "손익비 악화",
      correction: "되돌림 대기",
    }],
    nextTrainingFocus: ["진입 전 손익비 기록"],
  };

  assert.deepEqual(getSessionAiReviewVisibility(payload), {
    decisionReview: true,
    riskReview: true,
    behaviorPatterns: true,
    nextTrainingFocus: true,
  });
});

test("active training offers Chart Review only", () => {
  assert.deepEqual(ACTIVE_AI_REVIEW_TARGETS, ["CHART"]);
});

test("generated reviews expose viewing and loading actions, not regeneration", () => {
  assert.equal(GENERATED_REVIEW_ACTION_LABEL, "보기");
  assert.equal(EXISTING_SESSION_AI_ACTION_LABEL, "저장된 분석 불러오기");
  assert.notEqual(GENERATED_REVIEW_ACTION_LABEL, "재생성");
  assert.notEqual(EXISTING_SESSION_AI_ACTION_LABEL, "재생성");
});

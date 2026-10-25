import assert from "node:assert/strict";
import test from "node:test";
import {
  decisionPlanRelationFeedback,
  decisionPlanRelationLabel,
  fromDecisionCaptureContent,
  isDecisionCaptureComplete,
  PLAN_RELATION_OPTIONS,
  toDecisionCaptureContent,
} from "../src/hooks/training/decisionCapture.ts";

const complete = {
  thesis: "NEUTRAL",
  entryReason: "고점 돌파와 거래량 증가",
  riskNote: "박스권 안으로 재진입",
  exitPlan: "REASSESS",
  freeNote: "",
};

test("decision plan persists explicit fields and legacy review aliases", () => {
  const payload = toDecisionCaptureContent(complete);
  assert.equal(payload.currentView, "NEUTRAL");
  assert.equal(payload.entryCondition, complete.entryReason);
  assert.equal(payload.invalidationCondition, complete.riskNote);
  assert.equal(payload.ifInvalidated, "REASSESS");
  assert.equal(payload.entryReason, complete.entryReason);
  assert.deepEqual(payload.tags, ["SCENARIO", "DECISION_CAPTURE_V1"]);
});

test("decision plan restore supports v1 and legacy snapshots", () => {
  assert.deepEqual(fromDecisionCaptureContent(toDecisionCaptureContent(complete)), complete);
  const legacy = fromDecisionCaptureContent({
    thesis: "legacy view",
    entryReason: "legacy entry",
    riskNote: "legacy invalidation",
    exitPlan: "legacy exit plan",
  });
  assert.equal(legacy.thesis, "legacy view");
  assert.equal(isDecisionCaptureComplete(legacy), false);
});

test("all four concise decisions are required before save", () => {
  assert.equal(isDecisionCaptureComplete(complete), true);
  assert.equal(isDecisionCaptureComplete({ ...complete, riskNote: "" }), false);
});

test("decision relation presentation uses product language instead of enum names", () => {
  assert.deepEqual(
    PLAN_RELATION_OPTIONS.map(({ value, label }) => [value, label]),
    [
      ["FOLLOWED_PLAN", "계획대로"],
      ["CHANGED_PLAN", "계획 변경"],
      ["UNPLANNED", "즉흥 판단"],
    ],
  );
  assert.equal(decisionPlanRelationLabel("FOLLOWED_PLAN"), "계획대로");
  assert.equal(decisionPlanRelationLabel("CHANGED_PLAN"), "계획 변경");
});

test("successful action feedback names the recorded plan relation", () => {
  assert.equal(
    decisionPlanRelationFeedback("FOLLOWED_PLAN"),
    "계획대로 실행으로 기록했습니다.",
  );
  assert.equal(
    decisionPlanRelationFeedback("CHANGED_PLAN"),
    "계획 변경으로 기록했습니다.",
  );
  assert.equal(
    decisionPlanRelationFeedback("UNPLANNED"),
    "즉흥 판단으로 기록했습니다.",
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  fromDecisionCaptureContent,
  isDecisionCaptureComplete,
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
  assert.equal(fromDecisionCaptureContent({ thesis: "legacy view" }).thesis, "legacy view");
});

test("all four concise decisions are required before save", () => {
  assert.equal(isDecisionCaptureComplete(complete), true);
  assert.equal(isDecisionCaptureComplete({ ...complete, riskNote: "" }), false);
});

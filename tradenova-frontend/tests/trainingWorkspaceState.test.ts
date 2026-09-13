import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveReviewTargetChartId,
  transitionOrderMode,
} from "../src/hooks/training/trainingWorkspaceState.ts";

test("review target initializes from the active chart", () => {
  assert.equal(resolveReviewTargetChartId(null, 2, [1, 2, 3, 4]), 2);
});

test("an explicit review target is not overwritten by active chart changes", () => {
  assert.equal(resolveReviewTargetChartId(3, 1, [1, 2, 3, 4]), 3);
  assert.equal(resolveReviewTargetChartId(3, 2, [1, 2, 3, 4]), 3);
});

test("an unavailable review target falls back safely", () => {
  assert.equal(resolveReviewTargetChartId(9, 2, [1, 2, 3, 4]), 2);
  assert.equal(resolveReviewTargetChartId(null, null, []), null);
});

test("BUY and SELL open inline order mode", () => {
  assert.equal(transitionOrderMode(null, "OPEN_BUY"), "BUY");
  assert.equal(transitionOrderMode(null, "OPEN_SELL"), "SELL");
});

test("cancel and successful trade return to the default mode", () => {
  assert.equal(transitionOrderMode("BUY", "CANCEL"), null);
  assert.equal(transitionOrderMode("SELL", "TRADE_SUCCEEDED"), null);
});

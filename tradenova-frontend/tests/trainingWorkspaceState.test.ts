import assert from "node:assert/strict";
import test from "node:test";
import {
  transitionOrderMode,
  updateActionReason,
} from "../src/hooks/training/trainingWorkspaceState.ts";
import {
  chartReviewReducer,
  selectChartReview,
  type ChartReviewState,
} from "../src/hooks/training/chartReviewState.ts";
import {
  buildTradeEventPayload,
  clearPendingTradeReason,
} from "../src/hooks/training/trainingTradeReason.ts";
import type { TradeForm } from "../src/hooks/training/training.types.ts";
import type {
  TrainingEventResponse,
  TradeResponse,
} from "../src/types/training.ts";

const review = (chartId: number, summary: string): TrainingEventResponse => ({
  id: chartId,
  chartId,
  type: "AI",
  title: "AI",
  createdAt: "2026-09-14",
  payloadJson: { summary },
});
test("active chart selects its own review and never the previous chart payload", () => {
  let state: ChartReviewState = {};
  state = chartReviewReducer(state, { type: "start", key: "1:1", request: 1 });
  state = chartReviewReducer(state, {
    type: "finish",
    key: "1:1",
    request: 1,
    event: review(1, "one"),
    error: null,
  });
  assert.equal(
    selectChartReview(state, 1, 1).event?.payloadJson?.summary,
    "one",
  );
  assert.equal(selectChartReview(state, 1, 3).event, null);
  state = chartReviewReducer(state, { type: "start", key: "1:3", request: 2 });
  state = chartReviewReducer(state, {
    type: "finish",
    key: "1:3",
    request: 2,
    event: review(3, "three"),
    error: null,
  });
  state = chartReviewReducer(state, {
    type: "finish",
    key: "1:1",
    request: 1,
    event: review(1, "late one"),
    error: null,
  });
  assert.equal(
    selectChartReview(state, 1, 3).event?.payloadJson?.summary,
    "three",
  );
  assert.equal(selectChartReview(state, 2, 3).event, null);
});
test("obsolete same-chart requests and mismatched event chart IDs cannot replace a review", () => {
  let state = chartReviewReducer({}, { type: "start", key: "1:3", request: 1 });
  state = chartReviewReducer(state, { type: "start", key: "1:3", request: 2 });
  assert.equal(
    chartReviewReducer(state, {
      type: "finish",
      key: "1:3",
      request: 1,
      event: review(3, "old"),
      error: null,
    }),
    state,
  );
  state = chartReviewReducer(state, {
    type: "finish",
    key: "1:3",
    request: 2,
    event: review(1, "wrong"),
    error: null,
  });
  assert.equal(selectChartReview(state, 1, 3).event, null);
});
test("default has no dialog; BUY/SELL open and cancel/success close it", () => {
  assert.equal(transitionOrderMode(null, "CANCEL"), null);
  assert.equal(transitionOrderMode(null, "OPEN_BUY"), "BUY");
  assert.equal(transitionOrderMode(null, "OPEN_SELL"), "SELL");
  assert.equal(transitionOrderMode("BUY", "CANCEL"), null);
  assert.equal(transitionOrderMode("SELL", "TRADE_SUCCEEDED"), null);
});
const form: TradeForm = {
  qty: 2,
  reasons: [],
  entryReason: "",
  riskNote: "",
  reasonMode: "MANUAL",
  scenarioSnapshotId: null,
};
test("visible action text is included without a separate add action; typing never selects a plan", () => {
  const typed = updateActionReason(form, "거래량 확인");
  assert.equal(typed.reasonMode, "MANUAL");
  assert.equal(typed.scenarioSnapshotId, null);
  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 2,
    res: {} as TradeResponse,
    tradeForm: typed,
  });
  assert.equal(payload.reasons[0].entryReason, "거래량 확인");
  assert.equal(updateActionReason(typed, "수정").reasons?.length, 1);
  assert.equal(updateActionReason(typed, "").reasons?.length, 0);
});
test("plan plus visible action retains explicit selection and resets pending reasons on success", () => {
  const typed = updateActionReason(
    { ...form, reasonMode: "SCENARIO", scenarioSnapshotId: 7 },
    "지지 확인",
  );
  const payload = buildTradeEventPayload({
    side: "SELL",
    res: {} as TradeResponse,
    tradeForm: typed,
  });
  assert.equal(payload.scenarioSnapshotId, 7);
  assert.equal(payload.reasons.length, 2);
  assert.equal(payload.reasons[0].title, "사전 계획대로 청산");
  assert.equal(clearPendingTradeReason(typed).reasons?.length, 0);
});

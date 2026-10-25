import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { ReportDocumentResponse, TradeResponse } from "../src/types/training.ts";
import type { TradeForm } from "../src/hooks/training/training.types.ts";
import {
  buildTradeEventPayload,
  buildWaitEventPayload,
  canSubmitDecisionAction,
  clearPendingTradeReason,
  findLatestScenarioSnapshot,
  reconcileScenarioSelection,
  selectPlanRelation,
  selectTradeScenario,
} from "../src/hooks/training/trainingTradeReason.ts";

const snapshot = (
  id: number,
  chartId: number,
  tags: string[],
  createdAt: string,
): ReportDocumentResponse => ({
  id,
  chartId,
  kind: "SNAPSHOT",
  contentJson: {
    thesis: `관점 ${id}`,
    entryReason: "진입 조건",
    exitPlan: "청산 계획",
    riskNote: "무효화 조건",
    freeNote: "메모",
    tags,
  },
  createdAt,
  updatedAt: null,
});

const response: TradeResponse = {
  chartId: 7,
  tradeId: 99,
  cashBalance: 1_000,
  positionQty: 1,
  avgPrice: 100,
  executedPrice: 100,
  candleTime: 123456789,
};

const manualReason = {
  id: "manual-1",
  title: "추가 확인",
  entryReason: "긴 아래꼬리를 추가로 확인했다고 판단",
  riskNote: "",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const form = (overrides: Partial<TradeForm> = {}): TradeForm => ({
  qty: 10,
  entryReason: "",
  riskNote: "",
  reasons: [],
  reasonMode: "MANUAL",
  scenarioSnapshotId: null,
  planRelation: null,
  changeReason: "",
  ...overrides,
});

test("latest Scenario is selected for only the active chart", () => {
  const items = [
    snapshot(1, 7, ["SCENARIO"], "2026-01-01T00:00:00Z"),
    snapshot(2, 7, ["NOTE"], "2026-03-01T00:00:00Z"),
    snapshot(3, 8, ["SCENARIO"], "2026-04-01T00:00:00Z"),
    snapshot(4, 7, ["SCENARIO"], "2026-02-01T00:00:00Z"),
  ];

  assert.equal(findLatestScenarioSnapshot(items, 7)?.id, 4);
  assert.equal(findLatestScenarioSnapshot(items, 9), null);
});

test("same-time Scenario snapshots use the greater id deterministically", () => {
  const date = "2026-01-01T00:00:00Z";
  assert.equal(
    findLatestScenarioSnapshot([
      snapshot(10, 7, ["SCENARIO"], date),
      snapshot(11, 7, ["SCENARIO"], date),
    ], 7)?.id,
    11,
  );
});

test("FOLLOWED_PLAN BUY payload has the explicit relation and reference", () => {
  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 10,
    res: response,
    tradeForm: form({ reasonMode: "SCENARIO", scenarioSnapshotId: 55, planRelation: "FOLLOWED_PLAN" }),
  });

  assert.equal(payload.scenarioSnapshotId, 55);
  assert.equal(payload.reasonMode, "SCENARIO");
  assert.equal(payload.planRelation, "FOLLOWED_PLAN");
  assert.equal(payload.reasons[0].title, "기존 계획 실행");
});

test("Scenario SELL payload has a liquidation/invalidation user claim", () => {
  const payload = buildTradeEventPayload({
    side: "SELL",
    res: response,
    tradeForm: form({ reasonMode: "SCENARIO", scenarioSnapshotId: 55, planRelation: "FOLLOWED_PLAN" }),
  });

  assert.equal(payload.reasons[0].title, "기존 계획 실행");
});

test("manual mode remains unlinked and preserves manual reasons", () => {
  const payload = buildTradeEventPayload({
    side: "BUY",
    res: response,
    tradeForm: form({ reasons: [manualReason] }),
  });

  assert.equal("scenarioSnapshotId" in payload, false);
  assert.equal(payload.reasonMode, "MANUAL");
  assert.deepEqual(payload.reasons, [manualReason]);
});

test("Scenario and an additional manual reason are both retained", () => {
  const payload = buildTradeEventPayload({
    side: "BUY",
    res: response,
    tradeForm: form({
      reasonMode: "SCENARIO",
      scenarioSnapshotId: 55,
      planRelation: "CHANGED_PLAN",
      changeReason: "거래량 돌파가 새로 확인됨",
      reasons: [manualReason],
    }),
  });

  assert.equal(payload.planRelation, "CHANGED_PLAN");
  assert.equal(payload.changeReason, "거래량 돌파가 새로 확인됨");
  assert.equal(payload.reasonCount, 2);
  assert.equal(payload.reasons[1], manualReason);
});

test("pending reasons and Scenario selection clear without changing snapshots", () => {
  const savedScenario = snapshot(55, 7, ["SCENARIO"], "2026-01-01T00:00:00Z");
  const cleared = clearPendingTradeReason(form({
    reasonMode: "SCENARIO",
    scenarioSnapshotId: 55,
    planRelation: "FOLLOWED_PLAN",
    reasons: [manualReason],
  }));

  assert.deepEqual(cleared.reasons, []);
  assert.equal(cleared.reasonMode, "MANUAL");
  assert.equal(cleared.scenarioSnapshotId, null);
  assert.equal(cleared.planRelation, null);
  assert.equal(findLatestScenarioSnapshot([savedScenario], 7), savedScenario);
});

test("a newer Scenario clears the previously selected Scenario", () => {
  const staleSelection = form({
    reasonMode: "SCENARIO",
    scenarioSnapshotId: 10,
  });

  const reconciled = reconcileScenarioSelection(
    staleSelection,
    snapshot(11, 7, ["SCENARIO"], "2026-02-01T00:00:00Z"),
  );

  assert.equal(reconciled.reasonMode, "MANUAL");
  assert.equal(reconciled.scenarioSnapshotId, null);
});

test("an unavailable selected Scenario clears without removing manual reasons", () => {
  const selected = form({
    reasonMode: "SCENARIO",
    scenarioSnapshotId: 10,
    reasons: [manualReason],
  });
  const reconciled = reconcileScenarioSelection(selected, null);

  assert.equal(reconciled.reasonMode, "MANUAL");
  assert.equal(reconciled.scenarioSnapshotId, null);
  assert.deepEqual(reconciled.reasons, [manualReason]);
});

test("the selected Scenario remains selected while it is still latest", () => {
  const selected = form({
    reasonMode: "SCENARIO",
    scenarioSnapshotId: 10,
  });

  assert.equal(
    reconcileScenarioSelection(
      selected,
      snapshot(10, 7, ["SCENARIO"], "2026-01-01T00:00:00Z"),
    ),
    selected,
  );
});

test("a newly available Scenario is not automatically selected", () => {
  const manual = form({ reasons: [manualReason] });

  assert.equal(
    reconcileScenarioSelection(
      manual,
      snapshot(11, 7, ["SCENARIO"], "2026-02-01T00:00:00Z"),
    ),
    manual,
  );
});

test("a reconciled stale selection emits a manual payload without its old id", () => {
  const reconciled = reconcileScenarioSelection(
    form({ reasonMode: "SCENARIO", scenarioSnapshotId: 10 }),
    snapshot(11, 7, ["SCENARIO"], "2026-02-01T00:00:00Z"),
  );
  const payload = buildTradeEventPayload({
    side: "BUY",
    res: response,
    tradeForm: reconciled,
  });

  assert.equal(payload.reasonMode, "MANUAL");
  assert.equal("scenarioSnapshotId" in payload, false);
});

test("plan relation requires a plan and CHANGED_PLAN requires a reason", () => {
  const scenarios = [snapshot(55, 7, ["SCENARIO"], "2026-01-01T00:00:00Z")];
  const followedWithoutPlan = selectPlanRelation(form(), "FOLLOWED_PLAN", []);
  assert.equal(followedWithoutPlan.scenarioSnapshotId, null);
  assert.equal(canSubmitDecisionAction(followedWithoutPlan), false);

  const followed = selectPlanRelation(form(), "FOLLOWED_PLAN", scenarios);
  assert.equal(followed.scenarioSnapshotId, 55);
  assert.equal(canSubmitDecisionAction(followed), true);

  const changed = selectPlanRelation(form(), "CHANGED_PLAN", scenarios);
  assert.equal(canSubmitDecisionAction(changed), false);
  assert.equal(canSubmitDecisionAction({ ...changed, changeReason: "돌파 확인" }), true);
  assert.equal(canSubmitDecisionAction(selectPlanRelation(form(), "UNPLANNED", scenarios)), true);
});

test("plan relations auto-link the latest plan and still allow an older plan", () => {
  const latest = snapshot(56, 7, ["SCENARIO"], "2026-02-01T00:00:00Z");
  const previous = snapshot(55, 7, ["SCENARIO"], "2026-01-01T00:00:00Z");
  const scenarios = [latest, previous];

  const followed = selectPlanRelation(form(), "FOLLOWED_PLAN", scenarios);
  assert.equal(followed.scenarioSnapshotId, latest.id);
  assert.equal(canSubmitDecisionAction(followed), true);

  const changed = selectPlanRelation(form(), "CHANGED_PLAN", scenarios);
  assert.equal(changed.scenarioSnapshotId, latest.id);
  assert.equal(canSubmitDecisionAction(changed), false);
  assert.equal(
    canSubmitDecisionAction({ ...changed, changeReason: "새로운 저항 확인" }),
    true,
  );

  const unplanned = selectPlanRelation(form(), "UNPLANNED", scenarios);
  assert.equal(unplanned.scenarioSnapshotId, null);
  assert.equal(unplanned.reasonMode, "MANUAL");
  assert.equal(canSubmitDecisionAction(unplanned), true);

  const selectedPrevious = selectTradeScenario(followed, previous.id, scenarios);
  assert.equal(selectedPrevious.scenarioSnapshotId, previous.id);
  assert.equal(selectedPrevious.planRelation, "FOLLOWED_PLAN");
});

test("SELL ALL uses the shared decision gate before calling the trade API", () => {
  const scenarios = [snapshot(55, 7, ["SCENARIO"], "2026-01-01T00:00:00Z")];

  assert.equal(canSubmitDecisionAction(form()), false);
  assert.equal(
    canSubmitDecisionAction(selectPlanRelation(form(), "FOLLOWED_PLAN", scenarios)),
    true,
  );

  const changed = selectPlanRelation(form(), "CHANGED_PLAN", scenarios);
  assert.equal(canSubmitDecisionAction(changed), false);
  assert.equal(
    canSubmitDecisionAction({ ...changed, changeReason: "무효화 조건 재평가" }),
    true,
  );
  assert.equal(
    canSubmitDecisionAction(selectPlanRelation(form(), "UNPLANNED", scenarios)),
    true,
  );

  const hookSource = readFileSync(
    new URL("../src/hooks/training/useTrainingTrade.ts", import.meta.url),
    "utf8",
  );
  const sellAllStart = hookSource.indexOf("const onSellAll = async () => {");
  const sellAllEnd = hookSource.indexOf("\n  return {", sellAllStart);
  const sellAllSource = hookSource.slice(sellAllStart, sellAllEnd);
  const guardIndex = sellAllSource.indexOf("canSubmitDecisionAction(tradeForm)");
  const apiIndex = sellAllSource.indexOf("trainingApi.sellAll(activeChartId)");

  assert.ok(sellAllStart >= 0 && sellAllEnd > sellAllStart);
  assert.ok(guardIndex >= 0, "SELL ALL must use the shared Decision Capture guard");
  assert.ok(apiIndex > guardIndex, "SELL ALL must validate before calling the API");
});

test("WAIT payload records the user-selected relation without a canonical trade", () => {
  const payload = buildWaitEventPayload({
    candleTime: 123,
    price: 100,
    tradeForm: form({ planRelation: "UNPLANNED" }),
  });
  assert.equal(payload.side, "WAIT");
  assert.equal(payload.planRelation, "UNPLANNED");
  assert.equal("tradeId" in payload, false);
  assert.equal(payload.savedForAiReview, true);
});

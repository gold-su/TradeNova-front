import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTradeEventPayload,
  reconcileScenarioSelection,
  selectTradeScenario,
} from "../src/hooks/training/trainingTradeReason.ts";
import { getScenarioHistory } from "../src/hooks/training/trainingDecisionHistory.ts";
import type {
  ReportDocumentResponse,
  TradeResponse,
} from "../src/types/training.ts";
import type { TradeForm } from "../src/hooks/training/training.types.ts";

const make = (id: number, chartId = 7): ReportDocumentResponse => ({
  id,
  chartId,
  kind: "SNAPSHOT",
  createdAt: `2026-09-${id === 10 ? "01" : "02"}T00:00:00Z`,
  updatedAt: null,
  contentJson: {
    thesis: `관점 ${id}`,
    entryReason: "진입 조건",
    exitPlan: "청산 계획",
    riskNote: "무효화",
    freeNote: "",
    tags: ["SCENARIO"],
  },
});
const form: TradeForm = {
  qty: 2,
  reasonMode: "MANUAL",
  scenarioSnapshotId: null,
  reasons: [],
  entryReason: "",
  riskNote: "",
};
const response = {
  executedPrice: 12000,
  tradeId: 1,
  candleTime: 1,
} as TradeResponse;
const versions = getScenarioHistory([make(10), make(11)], 7);

test("v1 remains in history when v2 is appended and keeps its original id", () => {
  assert.deepEqual(
    versions.map(({ id }) => id),
    [11, 10],
  );
  assert.equal(versions[1].contentJson.thesis, "관점 10");
});
test("latest v2 BUY links exact v2 snapshot id", () => {
  const selected = selectTradeScenario(form, versions[0].id, versions);
  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 2,
    res: response,
    tradeForm: selected,
  });
  assert.equal(payload.reasonMode, "SCENARIO");
  assert.equal(payload.scenarioSnapshotId, 11);
});
test("historical v1 BUY links exact v1 snapshot id after v2 exists", () => {
  const selected = selectTradeScenario(form, versions[1].id, versions);
  assert.equal(reconcileScenarioSelection(selected, versions), selected);
  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 2,
    res: response,
    tradeForm: selected,
  });
  assert.equal(payload.scenarioSnapshotId, 10);
});
test("no-plan trade is MANUAL and carries no snapshot id or generated plan claim", () => {
  const manual = selectTradeScenario(
    selectTradeScenario(form, 10, versions),
    null,
    versions,
  );
  const payload = buildTradeEventPayload({
    side: "SELL",
    qty: 2,
    res: response,
    tradeForm: manual,
  });
  assert.equal(payload.reasonMode, "MANUAL");
  assert.equal("scenarioSnapshotId" in payload, false);
  assert.equal(payload.reasons.length, 0);
});
test("unknown or cross-chart scenario cannot be selected", () => {
  const otherChart = make(12, 8);
  const available = getScenarioHistory([...versions, otherChart], 7);
  assert.equal(
    selectTradeScenario(form, otherChart.id, available).scenarioSnapshotId,
    null,
  );
  assert.equal(selectTradeScenario(form, 999, available).reasonMode, "MANUAL");
});

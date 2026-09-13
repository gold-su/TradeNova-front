import assert from "node:assert/strict";
import test from "node:test";
import type { ReportDocumentResponse, TradeResponse } from "../src/types/training.ts";
import type { TradeForm } from "../src/hooks/training/training.types.ts";
import {
  buildTradeEventPayload,
  clearPendingTradeReason,
  findLatestScenarioSnapshot,
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

test("Scenario BUY payload has the reference and a user-claim reason", () => {
  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 10,
    res: response,
    tradeForm: form({ reasonMode: "SCENARIO", scenarioSnapshotId: 55 }),
  });

  assert.equal(payload.scenarioSnapshotId, 55);
  assert.equal(payload.reasonMode, "SCENARIO");
  assert.equal(payload.reasons[0].title, "사전 계획대로 진입");
  assert.match(payload.reasons[0].entryReason, /판단/);
});

test("Scenario SELL payload has a liquidation/invalidation user claim", () => {
  const payload = buildTradeEventPayload({
    side: "SELL",
    res: response,
    tradeForm: form({ reasonMode: "SCENARIO", scenarioSnapshotId: 55 }),
  });

  assert.equal(payload.reasons[0].title, "사전 계획대로 청산");
  assert.match(payload.reasons[0].entryReason, /청산 또는 무효화/);
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
      reasons: [manualReason],
    }),
  });

  assert.equal(payload.reasonCount, 2);
  assert.equal(payload.reasons[1], manualReason);
});

test("pending reasons and Scenario selection clear without changing snapshots", () => {
  const savedScenario = snapshot(55, 7, ["SCENARIO"], "2026-01-01T00:00:00Z");
  const cleared = clearPendingTradeReason(form({
    reasonMode: "SCENARIO",
    scenarioSnapshotId: 55,
    reasons: [manualReason],
  }));

  assert.deepEqual(cleared.reasons, []);
  assert.equal(cleared.reasonMode, "MANUAL");
  assert.equal(cleared.scenarioSnapshotId, null);
  assert.equal(findLatestScenarioSnapshot([savedScenario], 7), savedScenario);
});

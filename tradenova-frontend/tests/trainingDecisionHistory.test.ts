import assert from "node:assert/strict";
import test from "node:test";
import {
  getScenarioHistory,
  getTradeReasonHistory,
  SCENARIO_FIELDS,
} from "../src/hooks/training/trainingDecisionHistory.ts";
import type {
  ReportDocumentResponse,
  TrainingEventResponse,
} from "../src/types/training.ts";

test("Scenario history is chart scoped, newest first, and does not mutate input", () => {
  const items = [
    {
      id: 1,
      chartId: 1,
      createdAt: "2026-09-13",
      contentJson: { tags: ["SCENARIO"], thesis: "old" },
    },
    {
      id: 2,
      chartId: 2,
      createdAt: "2026-09-14",
      contentJson: { tags: ["SCENARIO"] },
    },
    {
      id: 3,
      chartId: 1,
      createdAt: "2026-09-14",
      contentJson: { tags: ["SCENARIO"], thesis: "new" },
    },
  ] as ReportDocumentResponse[];
  assert.deepEqual(
    getScenarioHistory(items, 1).map((item) => item.id),
    [3, 1],
  );
  assert.deepEqual(
    items.map((item) => item.id),
    [1, 2, 3],
  );
  assert.deepEqual(getScenarioHistory(items, null), []);
});
test("every scenario input has a concise writing example/helper", () => {
  assert.equal(SCENARIO_FIELDS.length, 5);
  assert.ok(SCENARIO_FIELDS.every((field) => field.example.length > 10));
});
test("trade history renders scenario linkage, manual counts and legacy reasons without internal fields", () => {
  const make = (
    id: number,
    payloadJson: Record<string, unknown>,
    chartId = 1,
  ): TrainingEventResponse => ({
    id,
    chartId,
    type: "TRADE",
    title: "SELL 실행",
    createdAt: "2026-09-14",
    payloadJson,
  });
  const rows = getTradeReasonHistory(
    [
      make(1, {
        reasonMode: "SCENARIO",
        scenarioSnapshotId: 8,
        reasons: [
          { id: "scenario-sell", title: "사전 계획대로 청산" },
          { id: "manual", entryReason: "목표 도달" },
        ],
      }),
      make(2, { entryReason: "legacy reason" }),
      make(3, { reasons: [{ title: "another chart" }] }, 3),
      make(4, {}),
    ],
    1,
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].label, "수동 근거");
  assert.equal(rows[0].reasons[0].entryReason, "legacy reason");
  assert.equal(rows[1].label, "현재 계획 사용 · 추가 근거 1개");
  assert.equal(rows[1].side, "SELL");
  assert.equal("scenarioSnapshotId" in rows[1], false);
});

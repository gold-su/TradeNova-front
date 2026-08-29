import assert from "node:assert/strict";
import test from "node:test";
import type { TrainingChartDto } from "../src/types/training.ts";
import {
  findRefreshedChart,
  moveChartKey,
  replaceActiveChartId,
  replaceChartKey,
} from "../src/hooks/training/trainingChartRefresh.ts";

const chart = (chartId: number, chartIndex: number): TrainingChartDto => ({
  chartId,
  chartIndex,
  symbolId: chartId,
  symbolTicker: "TEST",
  symbolName: "Test",
  trainingSector: "TEST",
  bars: 100,
  progressIndex: 20,
  status: "IN_PROGRESS",
  startDate: "2025-01-01",
  endDate: "2025-04-11",
});

test("reconciliation identifies only a changed chart in the same slot", () => {
  const oldChart = chart(10, 1);
  assert.equal(findRefreshedChart([chart(20, 1)], oldChart)?.chartId, 20);
  assert.equal(findRefreshedChart([oldChart], oldChart), null);
  assert.equal(findRefreshedChart([chart(20, 2)], oldChart), null);
});

test("refresh replaces keyed state without leaving the old chart key", () => {
  assert.deepEqual(replaceChartKey({ 10: "old", 30: "other" }, 10, 20, "new"), {
    20: "new",
    30: "other",
  });
});

test("chart indicator override follows its slot while unrelated overrides remain", () => {
  assert.deepEqual(moveChartKey({ 10: "override", 30: "other" }, 10, 20), {
    20: "override",
    30: "other",
  });
  assert.deepEqual(moveChartKey({ 30: "other" }, 10, 20), { 30: "other" });
});

test("only an active refreshed chart changes the active chart id", () => {
  assert.equal(replaceActiveChartId(10, 10, 20), 20);
  assert.equal(replaceActiveChartId(30, 10, 20), 30);
});

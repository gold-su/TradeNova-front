import assert from "node:assert/strict";
import test from "node:test";
import {
  getChartDataUpdateMode,
  shouldResetChartViewport,
} from "../src/components/training/chart/chartLifecycle.ts";

const mode = (overrides: Partial<Parameters<typeof getChartDataUpdateMode>[0]> = {}) =>
  getChartDataUpdateMode({
    initialized: true,
    previousChartId: 101,
    chartId: 101,
    previousLength: 2,
    previousLastTime: 2,
    candleTimes: [1, 2, 3],
    ...overrides,
  });

test("a different chart identity always replaces data and resets the viewport", () => {
  const result = mode({ chartId: 102, candleTimes: [10, 20] });

  assert.equal(result, "IDENTITY_CHANGE");
  assert.equal(shouldResetChartViewport(result), true);
});

test("NEXT appends only when the prior candle tail still matches", () => {
  assert.equal(mode(), "APPEND");
  assert.equal(shouldResetChartViewport(mode()), false);
});

test("same-chart hydration with different timestamps fully replaces data", () => {
  const result = mode({ candleTimes: [10, 20, 30] });

  assert.equal(result, "REPLACE");
  assert.equal(shouldResetChartViewport(result), false);
});

test("initial data fits the viewport", () => {
  const result = mode({ initialized: false });

  assert.equal(result, "INITIAL");
  assert.equal(shouldResetChartViewport(result), true);
});

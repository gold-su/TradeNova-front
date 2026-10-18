import assert from "node:assert/strict";
import test from "node:test";
import {
  applyTradeToProgressMap,
  isCurrentChartRequest,
} from "../src/hooks/training/trainingStateConsistency.ts";
import type {
  ProgressResponse,
  TradeResponse,
} from "../src/types/training.ts";

function progress(
  chartId: number,
  overrides: Partial<ProgressResponse> = {},
): ProgressResponse {
  return {
    chartId,
    progressIndex: 10,
    maxIndex: 100,
    remainingBars: 90,
    atLastBar: false,
    currentPrice: 100 + chartId,
    chartStatus: "IN_PROGRESS",
    sessionStatus: "IN_PROGRESS",
    cashBalance: 1_000_000,
    positionQty: chartId,
    avgPrice: 90 + chartId,
    autoExited: false,
    reason: null,
    revealedCandles: [],
    ...overrides,
  };
}

const trade: TradeResponse = {
  chartId: 1,
  tradeId: 11,
  cashBalance: 750_000,
  positionQty: 7,
  avgPrice: 123.45,
  executedPrice: 130,
  candleTime: 1_800_000_000,
};

test("a trade synchronizes shared cash while changing position data only on its chart", () => {
  const chartOne = progress(1);
  const chartTwo = progress(2);
  const before = { 1: chartOne, 2: chartTwo };

  const after = applyTradeToProgressMap(before, trade, progress(1));

  assert.equal(after[1].cashBalance, 750_000);
  assert.equal(after[1].positionQty, 7);
  assert.equal(after[1].avgPrice, 123.45);
  assert.equal(after[1].currentPrice, 130);

  assert.equal(after[2].cashBalance, 750_000);
  assert.equal(after[2].positionQty, chartTwo.positionQty);
  assert.equal(after[2].avgPrice, chartTwo.avgPrice);
  assert.equal(after[2].currentPrice, chartTwo.currentPrice);

  assert.equal(before[1], chartOne);
  assert.equal(before[2], chartTwo);
  assert.equal(before[1].cashBalance, 1_000_000);
  assert.equal(before[2].cashBalance, 1_000_000);
});

test("a trade creates a missing chart progress from the supplied fallback", () => {
  const existing = progress(2);
  const fallback = progress(1, { progressIndex: 0, positionQty: 0 });

  const after = applyTradeToProgressMap({ 2: existing }, trade, fallback);

  assert.equal(after[1].progressIndex, 0);
  assert.equal(after[1].cashBalance, trade.cashBalance);
  assert.equal(after[1].positionQty, trade.positionQty);
  assert.equal(after[2].cashBalance, trade.cashBalance);
});

test("chart hydration accepts only the latest request for the active chart", () => {
  const token = { chartId: 1, version: 3 };

  assert.equal(isCurrentChartRequest(1, 3, token), true);
  assert.equal(isCurrentChartRequest(2, 3, token), false);
  assert.equal(isCurrentChartRequest(1, 4, token), false);
  assert.equal(isCurrentChartRequest(null, 3, token), false);
});

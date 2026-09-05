import assert from "node:assert/strict";
import test from "node:test";
import { calculateUnrealizedPosition } from "../src/components/training/common/accountSnapshotCalculations.ts";

test("calculates positive, negative, and flat unrealized results", () => {
  assert.deepEqual(calculateUnrealizedPosition(110, 100, 5), {
    unrealizedPnl: 50,
    returnRate: 10,
  });
  assert.deepEqual(calculateUnrealizedPosition(90, 100, 5), {
    unrealizedPnl: -50,
    returnRate: -10,
  });
  assert.deepEqual(calculateUnrealizedPosition(100, 100, 5), {
    unrealizedPnl: 0,
    returnRate: 0,
  });
});

test("uses only the remaining quantity after a partial sell", () => {
  assert.deepEqual(calculateUnrealizedPosition(110_000, 110_500, 50), {
    unrealizedPnl: -25_000,
    returnRate: (-500 / 110_500) * 100,
  });
});

test("recalculates immediately when the current price changes", () => {
  assert.equal(calculateUnrealizedPosition(105, 100, 10).unrealizedPnl, 50);
  assert.equal(calculateUnrealizedPosition(95, 100, 10).unrealizedPnl, -50);
});

test("returns a natural empty result for a closed position", () => {
  assert.deepEqual(calculateUnrealizedPosition(null, 0, 0), {
    unrealizedPnl: 0,
    returnRate: 0,
  });
});

test("does not calculate an open position with invalid prices", () => {
  assert.deepEqual(calculateUnrealizedPosition(100, 0, 5), {
    unrealizedPnl: null,
    returnRate: null,
  });
  assert.deepEqual(calculateUnrealizedPosition(null, 100, 5), {
    unrealizedPnl: null,
    returnRate: null,
  });
});

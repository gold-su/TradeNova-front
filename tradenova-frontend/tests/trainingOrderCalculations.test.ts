import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateBuyQuantityByPercent,
  calculateEstimatedAmount,
  calculateSellQuantityByPercent,
} from "../src/components/training/common/trainingOrderCalculations.ts";

test("BUY percentages use available cash and floor to whole shares", () => {
  const quantities = [25, 50, 75, 100].map((percent) =>
    calculateBuyQuantityByPercent(1_000_000, 50_000, percent),
  );
  assert.deepEqual(quantities, [5, 10, 15, 20]);
  assert.equal(calculateBuyQuantityByPercent(100, 30, 50), 1);
});

test("SELL percentages floor while 100% returns the whole position", () => {
  const quantities = [25, 50, 75, 100].map((percent) =>
    calculateSellQuantityByPercent(20, percent),
  );
  assert.deepEqual(quantities, [5, 10, 15, 20]);
  assert.equal(calculateSellQuantityByPercent(3, 25), 0);
  assert.equal(calculateSellQuantityByPercent(3, 100), 3);
});

test("invalid order inputs safely produce zero instead of NaN", () => {
  assert.equal(calculateBuyQuantityByPercent(1_000, 0, 100), 0);
  assert.equal(calculateBuyQuantityByPercent(Number.NaN, 100, 100), 0);
  assert.equal(calculateSellQuantityByPercent(Number.NaN, 50), 0);
  assert.equal(calculateEstimatedAmount(32, 51_800), 1_657_600);
  assert.equal(calculateEstimatedAmount(Number.NaN, 51_800), 0);
  assert.equal(calculateEstimatedAmount(2, Number.NaN), 0);
});

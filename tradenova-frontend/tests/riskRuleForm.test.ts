import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateRiskRuleExitQuantity,
  calculatePriceChangePercent,
  calculateTargetPrice,
  canConfigureRiskRule,
  EXIT_PERCENT_CHOICES,
  isValidExitPercent,
  riskRuleDraftToRequest,
  riskRuleToDraft,
  submitRiskRuleDraft,
} from "../src/components/training/common/riskRuleForm.ts";

test("converts between target prices and changes from the current price", () => {
  assert.equal(calculatePriceChangePercent(95, 100), -5);
  assert.equal(calculatePriceChangePercent("105", 100), 5);
  assert.equal(calculateTargetPrice(100, -1), 99);
  assert.equal(calculateTargetPrice(100, -5), 95);
  assert.equal(calculateTargetPrice(100, 1), 101);
  assert.equal(calculateTargetPrice(100, 10), 110);
});

test("price change calculations reject empty or invalid values", () => {
  assert.equal(calculatePriceChangePercent("", 100), null);
  assert.equal(calculatePriceChangePercent("not-a-price", 100), null);
  assert.equal(calculatePriceChangePercent(95, null), null);
  assert.equal(calculatePriceChangePercent(95, 0), null);
  assert.equal(calculateTargetPrice(null, -5), null);
  assert.equal(calculateTargetPrice(Number.NaN, 5), null);
});

test("candidate prices round to the nearest whole won", () => {
  assert.equal(calculateTargetPrice(110_550, -1), 109_445);
  assert.equal(calculateTargetPrice(101, 1), 102);
});

test("calculates expected partial exit quantities with backend rounding rules", () => {
  assert.equal(calculateRiskRuleExitQuantity(100, 25), 25);
  assert.equal(calculateRiskRuleExitQuantity(100, 50), 50);
  assert.equal(calculateRiskRuleExitQuantity(3, 50), 1);
  assert.equal(calculateRiskRuleExitQuantity(1, 25), 1);
  assert.equal(calculateRiskRuleExitQuantity(7, 100), 7);
  assert.equal(calculateRiskRuleExitQuantity(0, 50), 0);
});

test("risk rules can only be configured while a position remains", () => {
  assert.equal(canConfigureRiskRule(0), false);
  assert.equal(canConfigureRiskRule(1), true);
  assert.equal(canConfigureRiskRule(3), true);
});

test("a zero position never submits a risk-rule PUT request", async () => {
  let putCalls = 0;
  const saved = await submitRiskRuleDraft(0, riskRuleToDraft(null), () => {
    putCalls += 1;
  });

  assert.equal(saved, false);
  assert.equal(putCalls, 0);
});

test("a positive or partially exited position can submit a risk rule", async () => {
  let putCalls = 0;
  const saveRiskRule = () => {
    putCalls += 1;
  };

  assert.equal(await submitRiskRuleDraft(100, riskRuleToDraft(null), saveRiskRule), true);
  assert.equal(await submitRiskRuleDraft(1, riskRuleToDraft(null), saveRiskRule), true);
  assert.equal(putCalls, 2);
});

test("new and legacy risk rules default both exit percentages to 100", () => {
  assert.equal(riskRuleToDraft(null).stopLossExitPercent, "100");
  assert.equal(riskRuleToDraft(null).takeProfitExitPercent, "100");

  const legacyRule = {
    id: 1,
    chartId: 2,
    accountId: 3,
    stopLossPrice: 90,
    takeProfitPrice: 120,
    autoExitEnabled: true,
    updatedAt: "2026-09-03T00:00:00Z",
  };
  assert.equal(riskRuleToDraft(legacyRule as never).stopLossExitPercent, "100");
  assert.equal(riskRuleToDraft(legacyRule as never).takeProfitExitPercent, "100");
});

test("offers all four quick exit percentage choices", () => {
  assert.deepEqual(EXIT_PERCENT_CHOICES, [25, 50, 75, 100]);
});

test("restores existing risk rule values", () => {
  const draft = riskRuleToDraft({
    id: 1,
    chartId: 2,
    accountId: 3,
    stopLossPrice: 90,
    stopLossExitPercent: 25,
    takeProfitPrice: 120,
    takeProfitExitPercent: 75,
    autoExitEnabled: false,
    updatedAt: "2026-09-03T00:00:00Z",
  });

  assert.deepEqual(draft, {
    stopLossPrice: "90",
    stopLossExitPercent: "25",
    takeProfitPrice: "120",
    takeProfitExitPercent: "75",
    autoExitEnabled: false,
  });
});

test("request payload includes both exit percentage fields", () => {
  assert.deepEqual(
    riskRuleDraftToRequest({
      stopLossPrice: "90",
      stopLossExitPercent: "50",
      takeProfitPrice: "120",
      takeProfitExitPercent: "75",
      autoExitEnabled: true,
    }),
    {
      stopLossPrice: 90,
      stopLossExitPercent: 50,
      takeProfitPrice: 120,
      takeProfitExitPercent: 75,
      autoExitEnabled: true,
    },
  );
});

test("invalid exit percentages cannot produce a request", () => {
  for (const value of ["", "0", "101", "25.5", "not-a-number"]) {
    assert.equal(isValidExitPercent(value), false);
    assert.equal(
      riskRuleDraftToRequest({
        ...riskRuleToDraft(null),
        stopLossExitPercent: value,
      }),
      null,
    );
  }
});

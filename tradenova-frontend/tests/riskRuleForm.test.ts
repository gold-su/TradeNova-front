import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateRiskRuleExitQuantity,
  EXIT_PERCENT_CHOICES,
  isValidExitPercent,
  riskRuleDraftToRequest,
  riskRuleToDraft,
} from "../src/components/training/common/riskRuleForm.ts";

test("calculates expected partial exit quantities with backend rounding rules", () => {
  assert.equal(calculateRiskRuleExitQuantity(100, 25), 25);
  assert.equal(calculateRiskRuleExitQuantity(100, 50), 50);
  assert.equal(calculateRiskRuleExitQuantity(3, 50), 1);
  assert.equal(calculateRiskRuleExitQuantity(1, 25), 1);
  assert.equal(calculateRiskRuleExitQuantity(7, 100), 7);
  assert.equal(calculateRiskRuleExitQuantity(0, 50), 0);
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

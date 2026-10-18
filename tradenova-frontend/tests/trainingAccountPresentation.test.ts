import assert from "node:assert/strict";
import test from "node:test";
import type { PaperAccountResponse } from "../src/api/paperAccountApi.ts";
import {
  formatTrainingMoney,
  parseInitialBalance,
  selectTrainingAccount,
  trainingAccountDelta,
} from "../src/pages/mypage/trainingAccountPresentation.ts";

function account(
  id: number,
  isDefault = false,
  cashBalance = 9_000_000,
): PaperAccountResponse {
  return {
    id,
    name: `Account ${id}`,
    description: null,
    initialBalance: 10_000_000,
    cashBalance,
    baseCurrency: "KRW",
    isDefault,
    createdAt: "2026-10-15T00:00:00Z",
  };
}

test("training account selection keeps an existing choice then falls back to default", () => {
  const accounts = [account(1), account(2, true)];
  assert.equal(selectTrainingAccount(accounts, 1)?.id, 1);
  assert.equal(selectTrainingAccount(accounts, 99)?.id, 2);
  assert.equal(selectTrainingAccount([], null), null);
});

test("training account presentation derives only deterministic account values", () => {
  assert.equal(trainingAccountDelta(account(1, false, 11_500_000)), 1_500_000);
  assert.equal(parseInitialBalance("10000000"), 10_000_000);
  assert.equal(parseInitialBalance("0"), null);
  assert.equal(parseInitialBalance("not-a-number"), null);
  assert.match(formatTrainingMoney(10_000_000), /10,000,000/);
});

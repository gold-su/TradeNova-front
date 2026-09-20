import assert from "node:assert/strict";
import test from "node:test";
import { cashDelta, formatWon, selectPrimaryAccount } from "../src/pages/mypage/accountPerformance.ts";
import type { PaperAccountResponse } from "../src/api/paperAccountApi.ts";

function account(id: number, initialBalance: number, cashBalance: number, isDefault = false): PaperAccountResponse {
  return { id, name: `계좌 ${id}`, initialBalance, cashBalance, baseCurrency: "KRW", isDefault, createdAt: "2026-09-20T00:00:00Z" };
}

test("account summary selects the default account and handles missing accounts", () => {
  const accounts = [account(1, 10_000, 9_000), account(2, 20_000, 21_000, true)];
  assert.equal(selectPrimaryAccount(accounts)?.id, 2);
  assert.equal(selectPrimaryAccount([]), null);
});

test("cash change and positive/negative KRW formatting are deterministic", () => {
  assert.equal(cashDelta(account(1, 10_000_000, 9_840_000)), -160_000);
  assert.equal(cashDelta(account(1, 10_000_000, 10_160_000)), 160_000);
  assert.equal(formatWon(-160_000, true), "-160,000원");
  assert.equal(formatWon(160_000, true), "+160,000원");
});

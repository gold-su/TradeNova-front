import assert from "node:assert/strict";
import test from "node:test";
import {
  isQuickPhraseSelected,
  removeQuickPhraseReason,
  selectedQuickPhraseIds,
  syncQuickPhraseReason,
  toggleQuickPhraseReason,
} from "../src/hooks/training/quickPhraseSelection.ts";
import { updateActionReason } from "../src/hooks/training/trainingWorkspaceState.ts";
import { buildTradeEventPayload } from "../src/hooks/training/trainingTradeReason.ts";
import type { TradeForm } from "../src/hooks/training/training.types.ts";
import type { QuickPhraseResponse, TradeResponse } from "../src/types/training.ts";

const form: TradeForm = {
  qty: 1,
  entryReason: "",
  riskNote: "",
  reasons: [],
  reasonMode: "MANUAL",
  scenarioSnapshotId: null,
};
const phrase: QuickPhraseResponse = {
  id: 4,
  title: "돌파",
  content: "거래량을 동반한 돌파 확인",
  sortOrder: 1,
};

test("BUY and SELL can toggle one quick phrase without duplicate selection", () => {
  const selected = toggleQuickPhraseReason(form, phrase);
  assert.equal(isQuickPhraseSelected(selected, phrase.id), true);
  assert.deepEqual([...selectedQuickPhraseIds(selected)], [phrase.id]);
  assert.equal(selected.reasons.length, 1);

  const buyPayload = buildTradeEventPayload({
    side: "BUY",
    qty: 1,
    res: {} as TradeResponse,
    tradeForm: selected,
  });
  const sellPayload = buildTradeEventPayload({
    side: "SELL",
    qty: 1,
    res: {} as TradeResponse,
    tradeForm: selected,
  });
  assert.equal(buyPayload.reasons.length, 1);
  assert.equal(sellPayload.reasons.length, 1);
  assert.equal(toggleQuickPhraseReason(selected, phrase).reasons.length, 0);
});

test("manual text and scenario selection remain intact beside quick phrases", () => {
  const scenarioForm = {
    ...form,
    reasonMode: "SCENARIO" as const,
    scenarioSnapshotId: 12,
  };
  const selected = toggleQuickPhraseReason(scenarioForm, phrase);
  const typed = updateActionReason(selected, "직접 확인한 지지선");
  assert.equal(typed.reasonMode, "SCENARIO");
  assert.equal(typed.scenarioSnapshotId, 12);
  assert.equal(typed.reasons.length, 2);

  const payload = buildTradeEventPayload({
    side: "BUY",
    qty: 1,
    res: {} as TradeResponse,
    tradeForm: typed,
  });
  assert.equal(payload.reasonMode, "SCENARIO");
  assert.equal(payload.scenarioSnapshotId, 12);
  assert.equal(payload.reasons.length, 3);
});

test("phrase updates sync selected text and delete removes stale selection only", () => {
  const typed = updateActionReason(toggleQuickPhraseReason(form, phrase), "수동 근거");
  const updated = syncQuickPhraseReason(typed, {
    ...phrase,
    title: "돌파 확인",
    content: "종가 돌파 확인",
  });
  assert.equal(
    updated.reasons.find((reason) => reason.id === "quick-phrase-4")?.entryReason,
    "종가 돌파 확인",
  );

  const removed = removeQuickPhraseReason(updated, phrase.id);
  assert.equal(isQuickPhraseSelected(removed, phrase.id), false);
  assert.equal(removed.reasons.length, 1);
  assert.equal(removed.reasons[0].id, "action-input");
});

import assert from "node:assert/strict";
import test from "node:test";
import { accountFeatureAvailability, getSessionAiLabel, getTrainingHistoryViewState, readStoredProfile, summarizeTrainingHistory } from "../src/pages/mypage/myPageState.ts";

test("my page reads the profile persisted by the login flow", () => {
  const values = new Map([["userEmail", "trader@example.com"], ["userNickname", "nova"]]);
  const profile = readStoredProfile({ getItem: (key) => values.get(key) ?? null });
  assert.deepEqual(profile, { email: "trader@example.com", nickname: "nova" });
});

test("my page only marks unsupported account capabilities", () => {
  assert.deepEqual(accountFeatureAvailability, {
    profileEdit: false,
    passwordChange: false,
    accountDeletion: false,
  });
});

test("training history exposes loading, error, empty and ready states", () => {
  assert.equal(getTrainingHistoryViewState({ loading: true, error: false, itemCount: 0 }), "loading");
  assert.equal(getTrainingHistoryViewState({ loading: false, error: true, itemCount: 0 }), "error");
  assert.equal(getTrainingHistoryViewState({ loading: false, error: false, itemCount: 0 }), "empty");
  assert.equal(getTrainingHistoryViewState({ loading: false, error: false, itemCount: 2 }), "ready");
});

test("session AI label only shows saved review and optional score", () => {
  assert.equal(getSessionAiLabel({ hasSessionAiReview: false, sessionAiScore: 90 }), null);
  assert.equal(getSessionAiLabel({ hasSessionAiReview: true, sessionAiScore: null }), "AI Review");
  assert.equal(getSessionAiLabel({ hasSessionAiReview: true, sessionAiScore: 72 }), "AI Review 72");
});

test("training summary aggregates only values returned by history", () => {
  assert.deepEqual(summarizeTrainingHistory([
    { totalTradeCount: 4, snapshotCount: 2 },
    { totalTradeCount: 3, snapshotCount: 1 },
  ]), { sessions: 2, trades: 7, snapshots: 3 });
  assert.deepEqual(summarizeTrainingHistory([]), { sessions: 0, trades: 0, snapshots: 0 });
});

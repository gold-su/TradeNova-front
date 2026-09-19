import assert from "node:assert/strict";
import test from "node:test";
import { accountFeatureAvailability, readStoredProfile } from "../src/pages/mypage/myPageState.ts";

test("my page reads the profile persisted by the login flow", () => {
  const values = new Map([["userEmail", "trader@example.com"], ["userNickname", "nova"]]);
  const profile = readStoredProfile({ getItem: (key) => values.get(key) ?? null });
  assert.deepEqual(profile, { email: "trader@example.com", nickname: "nova" });
});

test("my page does not claim unsupported account and history capabilities", () => {
  assert.deepEqual(accountFeatureAvailability, {
    profileEdit: false,
    passwordChange: false,
    accountDeletion: false,
    trainingHistory: false,
  });
});

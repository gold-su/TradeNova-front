import assert from "node:assert/strict";
import test from "node:test";

import {
  isValidKoreanMobileNumber,
  normalizeKoreanMobileNumber,
  normalizeSmsSubscription,
} from "../src/lib/landing/waitlistSms.ts";

test("normalizes a hyphenated Korean mobile number", () => {
  assert.equal(normalizeKoreanMobileNumber("010-1234-5678"), "01012345678");
  assert.equal(isValidKoreanMobileNumber("010-1234-5678"), true);
  assert.equal(isValidKoreanMobileNumber("011-123-4567"), false);
});

test("removes the phone number from an SMS opt-out request", () => {
  assert.deepEqual(normalizeSmsSubscription(false, "010-1234-5678"), {
    smsOptIn: false,
    phoneNumber: null,
  });
});

test("normalizes the phone number in an SMS opt-in request", () => {
  assert.deepEqual(normalizeSmsSubscription(true, "010-1234-5678"), {
    smsOptIn: true,
    phoneNumber: "01012345678",
  });
});


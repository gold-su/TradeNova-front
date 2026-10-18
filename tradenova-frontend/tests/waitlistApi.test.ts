import assert from "node:assert/strict";
import test from "node:test";
import {
  DuplicateWaitlistEmailError,
  InvalidWaitlistApplicationError,
} from "../src/lib/landing/waitlistErrors.ts";

test("waitlist API exposes distinct duplicate and validation errors", () => {
  assert.notEqual(
    new DuplicateWaitlistEmailError().name,
    new InvalidWaitlistApplicationError().name,
  );
  assert.equal(new DuplicateWaitlistEmailError().name, "DuplicateWaitlistEmailError");
  assert.equal(new InvalidWaitlistApplicationError().name, "InvalidWaitlistApplicationError");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  BETA_WAITLIST_PATH,
  isPublicBetaClosedResponse,
  resolvePublicBetaAccessView,
} from "../src/lib/publicBetaAccess.ts";

test("private beta closes access for a regular visitor", () => {
  assert.equal(resolvePublicBetaAccessView({ publicBetaEnabled: false, accessAllowed: false }), "CLOSED");
});

test("allowlisted users keep the existing product flow", () => {
  assert.equal(resolvePublicBetaAccessView({ publicBetaEnabled: false, accessAllowed: true }), "ALLOWED");
});

test("public beta keeps signup and product routes open", () => {
  assert.equal(resolvePublicBetaAccessView({ publicBetaEnabled: true, accessAllowed: false }), "ALLOWED");
});

test("only the backend public beta error triggers the closed UX", () => {
  assert.equal(isPublicBetaClosedResponse(403, "PUBLIC_BETA_CLOSED"), true);
  assert.equal(isPublicBetaClosedResponse(403, "FORBIDDEN_RESOURCE"), false);
  assert.equal(isPublicBetaClosedResponse(401, "PUBLIC_BETA_CLOSED"), false);
});

test("closed UX points to the existing landing waitlist", () => {
  assert.equal(BETA_WAITLIST_PATH, "/#beta-apply");
});

import assert from "node:assert/strict";
import test from "node:test";
import { hasValidAccessToken } from "../src/lib/authSession.ts";

function storageWith(token: string | null): Storage {
  const values = new Map<string, string>();
  if (token) values.set("accessToken", token);
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

function tokenWithExpiry(exp: number) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `header.${payload}.signature`;
}

test("auth session accepts an unexpired JWT", () => {
  assert.equal(hasValidAccessToken(storageWith(tokenWithExpiry(2_000)), 1_000_000), true);
});

test("auth session rejects expired, malformed, and missing JWTs", () => {
  assert.equal(hasValidAccessToken(storageWith(tokenWithExpiry(1_000)), 1_000_000), false);
  assert.equal(hasValidAccessToken(storageWith("not-a-jwt"), 1_000_000), false);
  assert.equal(hasValidAccessToken(storageWith(null), 1_000_000), false);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  persistLanguage,
  resolveInitialLanguage,
} from "../src/i18n/language.ts";
import { trainingMessages } from "../src/i18n/resources/training.ts";

test("English is the default language when no valid preference is stored", () => {
  assert.equal(DEFAULT_LANGUAGE, "en");
  assert.equal(resolveInitialLanguage(), "en");
  assert.equal(resolveInitialLanguage({ getItem: () => null }), "en");
  assert.equal(resolveInitialLanguage({ getItem: () => "ja" }), "en");
});

test("a saved English or Korean preference wins and persists under one stable key", () => {
  assert.equal(resolveInitialLanguage({ getItem: () => "ko" }), "ko");
  assert.equal(resolveInitialLanguage({ getItem: () => "en" }), "en");

  const writes: Array<[string, string]> = [];
  persistLanguage({
    getItem: () => null,
    setItem: (key, value) => writes.push([key, value]),
  }, "ko");
  assert.deepEqual(writes, [[LANGUAGE_STORAGE_KEY, "ko"]]);
});

test("semantic resources contain natural EN and KO product copy", () => {
  assert.equal(trainingMessages.en.plan.currentView, "Current View");
  assert.equal(trainingMessages.ko.plan.currentView, "현재 관점");
  assert.equal(trainingMessages.en.chart.shares, "{count} shares");
  assert.equal(trainingMessages.ko.chart.shares, "{count}주");
});

test("localized labels never mutate API enum values", () => {
  const payload = {
    side: "BUY" as const,
    planRelation: "FOLLOWED_PLAN" as const,
  };
  assert.equal(trainingMessages.en.relation.followed, "Followed the plan");
  assert.equal(trainingMessages.ko.relation.followed, "계획대로");
  assert.deepEqual(payload, { side: "BUY", planRelation: "FOLLOWED_PLAN" });
});

test("the app document opts out of browser translation without changing its default language", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="en" translate="no" class="notranslate">/);
  assert.match(html, /<meta name="google" content="notranslate" \/>/);
});

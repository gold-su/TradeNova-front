import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  persistLanguage,
  resolveInitialLanguage,
} from "../src/i18n/language.ts";
import { landingMessages } from "../src/i18n/resources/landing.ts";
import { trainingMessages } from "../src/i18n/resources/training.ts";
import {
  PUBLIC_BETA_SECTION_ID,
  PUBLIC_LANDING_NAV_ITEMS,
} from "../src/lib/landing/navigation.ts";

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

test("public brand metadata uses DeciReps and the production domain", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
  const sitemap = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");

  assert.equal(landingMessages.en.meta.title, "DeciReps | Train your trading decisions");
  assert.equal(landingMessages.ko.meta.title, "DeciReps | 투자 판단을 훈련하세요");
  assert.match(html, /<meta property="og:site_name" content="DeciReps" \/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/decireps\.com\/" \/>/);
  assert.match(robots, /https:\/\/decireps\.com\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/decireps\.com\/<\/loc>/);
});

test("public landing navigation exposes only working training preview and FAQ anchors", () => {
  const homePage = readFileSync(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");

  assert.deepEqual(PUBLIC_LANDING_NAV_ITEMS, [
    { sectionId: "product-preview", labelKey: "landing.nav.preview" },
    { sectionId: "faq", labelKey: "landing.nav.faq" },
  ]);
  for (const { sectionId } of PUBLIC_LANDING_NAV_ITEMS) {
    assert.match(homePage, new RegExp(`id=["']${sectionId}["']`));
  }
  assert.equal(landingMessages.en.nav.preview, "Training preview");
  assert.equal(landingMessages.ko.nav.preview, "훈련 화면");
  assert.equal(landingMessages.en.nav.faq, "FAQ");
  assert.equal(landingMessages.ko.nav.faq, "FAQ");
});

test("header beta calls to action target the real waitlist section", () => {
  const appHeader = readFileSync(new URL("../src/components/layout/AppHeader.tsx", import.meta.url), "utf8");
  const homePage = readFileSync(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");

  assert.equal(PUBLIC_BETA_SECTION_ID, "beta-apply");
  assert.match(homePage, /id=\{PUBLIC_BETA_SECTION_ID\}/);
  assert.equal(
    appHeader.match(/handleLandingSectionClick\(event, PUBLIC_BETA_SECTION_ID\)/g)?.length,
    2,
  );
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

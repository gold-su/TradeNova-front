import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { BlindContentCase } from "../src/api/contentStudioApi.ts";
import {
  nextVisibleIndex,
  toBlindChartCandles,
} from "../src/lib/admin/contentStudio.ts";
import {
  formatCandleAxisDate,
  formatCandleTooltipDate,
} from "../src/lib/chart/candleDateDisplay.ts";

const contentCase: BlindContentCase = {
  caseKey: "opaque-case",
  analysisBars: 2,
  futureBars: 5,
  visibleThroughIndex: 1,
  remainingBars: 5,
  atEnd: false,
  candles: [
    { idx: 0, o: 10, h: 12, l: 9, c: 11, v: 100 },
    { idx: 1, o: 11, h: 13, l: 10, c: 12, v: 120 },
  ],
};

test("blind content candles use stable synthetic time without a real date field", () => {
  const candles = toBlindChartCandles(contentCase);
  assert.equal(candles.length, 2);
  assert.equal(candles[1].t - candles[0].t, 86_400_000);
  assert.equal("date" in candles[0], false);
});

test("NEXT moves by exactly one or five candles and clamps at the case end", () => {
  assert.equal(nextVisibleIndex(contentCase, 1), 2);
  assert.equal(nextVisibleIndex(contentCase, 5), 6);
  assert.equal(nextVisibleIndex({ ...contentCase, visibleThroughIndex: 5 }, 5), 6);
});

test("admin hidden-date mode masks dates while the default actual formatter remains unchanged", () => {
  const timestamp = Date.UTC(2024, 0, 3);
  assert.equal(formatCandleTooltipDate(timestamp, "en-US", "HIDDEN", 4), "#5");
  assert.equal(formatCandleAxisDate(timestamp, "ko-KR", "HIDDEN", 4), "#5");
  assert.match(formatCandleTooltipDate(timestamp, "en-US", "ACTUAL", 4), /2024/);
  assert.equal(formatCandleAxisDate(timestamp, "ko-KR", "ACTUAL", 4), "2024");
});

test("content studio is protected by the backend-authoritative admin access check", () => {
  const router = readFileSync(new URL("../src/router.tsx", import.meta.url), "utf8");
  const adminRoute = readFileSync(new URL("../src/components/auth/AdminOnlyRoute.tsx", import.meta.url), "utf8");
  const api = readFileSync(new URL("../src/api/contentStudioApi.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/pages/admin/ContentStudioPage.tsx", import.meta.url), "utf8");

  assert.match(router, /path: "\/admin\/content-studio"/);
  assert.match(router, /<AdminOnlyRoute><ContentStudioPage \/><\/AdminOnlyRoute>/);
  assert.match(adminRoute, /contentStudioApi\.getAccess\(\)/);
  assert.match(api, /\/api\/admin\/content-studio/);
  assert.doesNotMatch(api, /\/api\/training/);
  assert.match(page, /if \(captureMode\)/);
  assert.match(page, /data-capture-frame/);
  assert.match(page, /aspect-\[4\/5\]/);
});

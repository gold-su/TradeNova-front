import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { BlindContentCase } from "../src/api/contentStudioApi.ts";
import {
  nextVisibleIndex,
  toBlindChartCandles,
} from "../src/lib/admin/contentStudio.ts";
import {
  CONTENT_CAPTURE_HEIGHT,
  CONTENT_CAPTURE_WIDTH,
  CONTENT_PREVIEW_MAX_WIDTH,
  createContentCaptureFilename,
  inspectContentCandleQuality,
  previewScaleForWidth,
} from "../src/lib/admin/contentCapture.ts";
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

test("capture preview scales down while PNG dimensions stay fixed at Instagram 4:5", () => {
  assert.equal(CONTENT_CAPTURE_WIDTH, 1080);
  assert.equal(CONTENT_CAPTURE_HEIGHT, 1350);
  assert.equal(CONTENT_CAPTURE_WIDTH / CONTENT_CAPTURE_HEIGHT, 4 / 5);
  assert.equal(CONTENT_PREVIEW_MAX_WIDTH, 430);
  assert.equal(previewScaleForWidth(430), 430 / 1080);
  assert.equal(previewScaleForWidth(1080), 1);
  assert.equal(previewScaleForWidth(1400), 1);
  assert.equal(previewScaleForWidth(0), 0);
});

test("capture filenames use only a content number, state, and timestamp", () => {
  const now = new Date("2026-11-11T03:04:05.000Z");
  assert.equal(
    createContentCaptureFilename(7, false, now),
    "decireps-content-007-blind-20261111030405.png",
  );
  assert.equal(
    createContentCaptureFilename(7, true, now),
    "decireps-content-007-revealed-20261111030405.png",
  );
});

test("stored candle diagnostics flag invalid OHLC and split-like discontinuities without changing data", () => {
  const normal = [
    { o: 10, h: 12, l: 9, c: 11 },
    { o: 11, h: 13, l: 10, c: 12 },
  ];
  const normalSnapshot = structuredClone(normal);
  assert.deepEqual(inspectContentCandleQuality(normal), {
    invalidOhlc: false,
    possibleCorporateAction: false,
    maxCloseJumpRatio: 12 / 11,
  });
  assert.deepEqual(normal, normalSnapshot);

  assert.equal(inspectContentCandleQuality([
    { o: 100, h: 102, l: 98, c: 100 },
    { o: 20, h: 21, l: 19, c: 20 },
  ]).possibleCorporateAction, true);
  assert.equal(inspectContentCandleQuality([
    { o: 10, h: 9, l: 8, c: 11 },
  ]).invalidOhlc, true);
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
  assert.match(page, /CONTENT_CAPTURE_WIDTH/);
  assert.match(page, /CONTENT_CAPTURE_HEIGHT/);
  assert.match(page, /toPng\(frame/);
  assert.match(page, /pixelRatio: 1/);
  assert.match(page, /createContentCaptureFilename\(contentNumber, Boolean\(reveal\)\)/);
  assert.match(page, /chartId=\{contentNumber \* 10_000 \+ \(reveal \? 9_999 : contentCase\?\.visibleThroughIndex \?\? 0\)\}/);
});

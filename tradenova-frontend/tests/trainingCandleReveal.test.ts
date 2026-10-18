import assert from "node:assert/strict";
import test from "node:test";
import type {
  Candle,
  ProgressResponse,
  RevealedCandle,
  TrainingChartDto,
} from "../src/types/training.ts";
import {
  appendRevealedCandles,
  appendRevealedCandlesForChart,
  getTrainingProgressDisplay,
  revealedCandleToCandle,
} from "../src/hooks/training/trainingCandleReveal.ts";

const candle = (idx: number): RevealedCandle => ({
  idx,
  t: 1_770_000_000_000 + idx,
  o: 100 + idx,
  h: 105 + idx,
  l: 99 + idx,
  c: 103 + idx,
  v: 1_000 + idx,
});

const progress = (chartId: number, revealedCandles: RevealedCandle[]): ProgressResponse => ({
  chartId,
  progressIndex: 199 + revealedCandles.length,
  maxIndex: 299,
  remainingBars: 100 - revealedCandles.length,
  atLastBar: false,
  currentPrice: 100,
  chartStatus: "IN_PROGRESS",
  sessionStatus: "IN_PROGRESS",
  cashBalance: 1_000,
  positionQty: 0,
  avgPrice: 0,
  autoExited: false,
  reason: null,
  revealedCandles,
});

const chart = (bars: number, progressIndex: number): TrainingChartDto => ({
  chartId: 1,
  chartIndex: 0,
  symbolId: 1,
  symbolTicker: "TEST",
  symbolName: "Test",
  trainingSector: "TEST",
  bars,
  progressIndex,
  status: "IN_PROGRESS",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
});

test("converts every revealed candle field to the chart candle model", () => {
  assert.deepEqual(revealedCandleToCandle(candle(200)), candle(200));
});

test("appends one revealed candle to 200 authoritative visible candles", () => {
  const visible = Array.from({ length: 200 }, (_, idx) => candle(idx) as Candle);
  assert.equal(appendRevealedCandles(visible, [candle(200)]).length, 201);
});

test("applying an identical candle index twice is idempotent", () => {
  const visible = Array.from({ length: 200 }, (_, idx) => candle(idx) as Candle);
  const once = appendRevealedCandles(visible, [candle(200)]);
  const twice = appendRevealedCandles(once, [candle(200)]);
  assert.equal(twice.length, 201);
});

test("multiple reveals append in canonical index order", () => {
  const visible = Array.from({ length: 200 }, (_, idx) => candle(idx) as Candle);
  const result = appendRevealedCandles(visible, [204, 200, 203, 201, 202].map(candle));
  assert.deepEqual(result.slice(-5).map((item) => item.idx), [200, 201, 202, 203, 204]);
});

test("an early exit appends only candles actually returned by the server", () => {
  const visible = Array.from({ length: 200 }, (_, idx) => candle(idx) as Candle);
  assert.equal(appendRevealedCandles(visible, [200, 201, 202].map(candle)).length, 203);
});

test("a chart response updates only its own candle collection", () => {
  const state = { 1: [candle(0)], 2: [candle(0)] };
  const result = appendRevealedCandlesForChart(state, progress(1, [candle(1)]));
  assert.equal(result[1].length, 2);
  assert.equal(result[2], state[2]);
});

test("hydrate treats the GET candle list as the complete authoritative state", () => {
  const stale = Array.from({ length: 300 }, (_, idx) => candle(idx));
  const visibleGet = stale.slice(0, 200);
  const hydrated = { 1: visibleGet };
  assert.equal(hydrated[1].length, 200);
  assert.equal(hydrated[1].at(-1)?.idx, 199);
});

test("new sessions display progress relative to the 100 training bars", () => {
  assert.deepEqual([199, 200, 249, 299].map((raw) =>
    getTrainingProgressDisplay(chart(300, raw), null).current), [0, 1, 50, 100]);
});

test("legacy sessions display progress relative to the 40 training bars", () => {
  assert.deepEqual([59, 60, 99].map((raw) =>
    getTrainingProgressDisplay(chart(100, raw), null).current), [0, 1, 40]);
});

test("authoritative server training progress takes precedence", () => {
  const serverProgress = {
    ...progress(1, []),
    progressIndex: 249,
    analysisBars: 200,
    trainingBars: 100,
    trainingProgress: 17,
  };
  assert.deepEqual(getTrainingProgressDisplay(chart(300, 249), serverProgress), {
    current: 17,
    total: 100,
  });
});

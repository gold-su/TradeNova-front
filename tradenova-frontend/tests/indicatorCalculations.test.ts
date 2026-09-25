import assert from "node:assert/strict";
import test from "node:test";
import type { Candle } from "../src/types/training.ts";
import { calculateRSI } from "../src/lib/chart/indicators/rsi.ts";
import { calculateMACD } from "../src/lib/chart/indicators/macd.ts";
import { calculateBollinger } from "../src/lib/chart/indicators/bollinger.ts";
import {
  toChartTime,
  toMovingAverageData,
} from "../src/lib/chart/indicators/seriesData.ts";

const DAY = 86_400_000;
const START = 1_700_000_000_000;

function candles(closes: number[]): Candle[] {
  return closes.map((close, index) => ({
    idx: index,
    t: START + index * DAY,
    o: close,
    h: close + 1,
    l: close - 1,
    c: close,
    v: 100 + index,
  }));
}

function values(data: Array<{ value: number }>) {
  return data.map((point) => point.value);
}

function assertApproximately(actual: number, expected: number, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

test("RSI requires period plus one candles and aligns the first output", () => {
  assert.deepEqual(calculateRSI(candles([1, 2, 3]), 3), []);

  const input = candles([1, 2, 3, 4]);
  const result = calculateRSI(input, 3);

  assert.equal(result.length, 1);
  assert.equal(result[0].time, toChartTime(input[3].t));
});

test("RSI returns 100, 0, and 50 for rising, falling, and flat markets", () => {
  assert.deepEqual(values(calculateRSI(candles([1, 2, 3, 4]), 3)), [100]);
  assert.deepEqual(values(calculateRSI(candles([4, 3, 2, 1]), 3)), [0]);
  assert.deepEqual(values(calculateRSI(candles([2, 2, 2, 2]), 3)), [50]);
});

test("RSI uses the initial average then Wilder smoothing for later candles", () => {
  const input = candles([1, 2, 1, 3, 2]);
  const result = calculateRSI(input, 3);

  assert.deepEqual(values(result), [75, 54.55]);
  assert.equal(result.length, input.length - 3);
  assert.deepEqual(
    result.map((point) => point.time),
    [toChartTime(input[3].t), toChartTime(input[4].t)],
  );
});

test("MACD stays empty until both the slow and signal warm-ups complete", () => {
  const firstOutputIndex = 26 + 9 - 2;

  assert.deepEqual(calculateMACD(candles(Array(firstOutputIndex).fill(10))), {
    macdLine: [],
    signalLine: [],
    histogram: [],
  });
});

test("MACD flat series produces aligned zero-valued outputs", () => {
  const input = candles(Array(40).fill(25));
  const result = calculateMACD(input);

  assert.ok(result.macdLine.length > 0);
  assert.equal(result.macdLine.length, result.signalLine.length);
  assert.equal(result.macdLine.length, result.histogram.length);
  assert.ok(values(result.macdLine).every((value) => value === 0));
  assert.ok(values(result.signalLine).every((value) => value === 0));
  assert.ok(values(result.histogram).every((value) => value === 0));
});

test("MACD rising and falling series remain finite with the expected sign", () => {
  const rising = calculateMACD(candles(Array.from({ length: 45 }, (_, i) => i + 1)));
  const falling = calculateMACD(candles(Array.from({ length: 45 }, (_, i) => 45 - i)));
  const allValues = [
    ...values(rising.macdLine),
    ...values(rising.signalLine),
    ...values(rising.histogram),
    ...values(falling.macdLine),
    ...values(falling.signalLine),
    ...values(falling.histogram),
  ];

  assert.ok(values(rising.macdLine).every((value) => value > 0));
  assert.ok(values(falling.macdLine).every((value) => value < 0));
  assert.ok(allValues.every(Number.isFinite));
});

test("MACD default output starts at index 33 with consistent timestamps", () => {
  const input = candles(Array.from({ length: 40 }, (_, i) => i + 1));
  const result = calculateMACD(input);
  const expectedTimes = input.slice(33).map((candle) => toChartTime(candle.t));

  assert.equal(result.macdLine.length, input.length - 33);
  assert.deepEqual(result.macdLine.map((point) => point.time), expectedTimes);
  assert.deepEqual(result.signalLine.map((point) => point.time), expectedTimes);
  assert.deepEqual(result.histogram.map((point) => point.time), expectedTimes);
});

test("Bollinger returns no data before the period or for invalid parameters", () => {
  const input = candles([1, 2]);

  assert.deepEqual(calculateBollinger(input, 3, 2), {
    upper: [],
    middle: [],
    lower: [],
  });
  assert.deepEqual(calculateBollinger(input, 0, 2), {
    upper: [],
    middle: [],
    lower: [],
  });
  assert.deepEqual(calculateBollinger(input, 2, -1), {
    upper: [],
    middle: [],
    lower: [],
  });
});

test("Bollinger period boundary keeps flat bands equal and time-aligned", () => {
  const input = candles([5, 5, 5]);
  const result = calculateBollinger(input, 3, 2);

  assert.deepEqual(values(result.upper), [5]);
  assert.deepEqual(values(result.middle), [5]);
  assert.deepEqual(values(result.lower), [5]);
  assert.equal(result.middle[0].time, toChartTime(input[2].t));
});

test("Bollinger uses population standard deviation on sorted input", () => {
  const input = candles([1, 2, 3]).reverse();
  const result = calculateBollinger(input, 3, 2);
  const standardDeviation = Math.sqrt(2 / 3);

  assertApproximately(result.middle[0].value, 2);
  assertApproximately(result.upper[0].value, 2 + 2 * standardDeviation);
  assertApproximately(result.lower[0].value, 2 - 2 * standardDeviation);
  assert.equal(result.upper.length, 1);
  assert.equal(result.upper[0].time, toChartTime(START + 2 * DAY));
});

test("moving averages reject invalid periods and seed EMA from its first window", () => {
  const input = candles([1, 2, 3, 4]);

  assert.deepEqual(toMovingAverageData(input, 0, "SMA"), []);
  assert.deepEqual(values(toMovingAverageData(input, 3, "SMA")), [2, 3]);
  assert.deepEqual(values(toMovingAverageData(input, 3, "EMA")), [2, 3]);
});

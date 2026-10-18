import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_INDICATORS } from "../src/components/training/chart/indicator/indicatorDefaults.ts";
import { isIndicatorVisible } from "../src/components/training/chart/indicator/indicatorDisplayPolicy.ts";
import { applyIndicatorPreset } from "../src/components/training/chart/indicator/indicatorPresets.ts";
import type { IndicatorSettings } from "../src/types/training.ts";

function settings(): IndicatorSettings {
  return structuredClone(DEFAULT_INDICATORS);
}

test("compact mode hides RSI and MACD without changing their settings", () => {
  const current = settings();
  current.rsi.enabled = true;
  current.macd.enabled = true;

  assert.equal(isIndicatorVisible(current, "rsi", "COMPACT"), false);
  assert.equal(isIndicatorVisible(current, "macd", "COMPACT"), false);
  assert.equal(current.rsi.enabled, true);
  assert.equal(current.macd.enabled, true);
});

test("compact mode keeps MA, volume, and Bollinger visible", () => {
  const current = settings();
  current.ma.enabled = true;
  current.volume.enabled = true;
  current.bollinger.enabled = true;

  assert.equal(isIndicatorVisible(current, "ma", "COMPACT"), true);
  assert.equal(isIndicatorVisible(current, "volume", "COMPACT"), true);
  assert.equal(isIndicatorVisible(current, "bollinger", "COMPACT"), true);
});

test("full mode restores enabled RSI and MACD after compact mode", () => {
  const current = settings();
  current.rsi.enabled = true;
  current.macd.enabled = true;

  assert.equal(isIndicatorVisible(current, "rsi", "COMPACT"), false);
  assert.equal(isIndicatorVisible(current, "macd", "COMPACT"), false);
  assert.equal(isIndicatorVisible(current, "rsi", "FULL"), true);
  assert.equal(isIndicatorVisible(current, "macd", "FULL"), true);
});

test("basic preset enables SMA 20/60 and volume", () => {
  const result = applyIndicatorPreset(settings(), "BASIC");

  assert.equal(result.ma.enabled, true);
  assert.equal(result.ma.type, "SMA");
  assert.deepEqual(result.ma.lines.map((line) => line.period), [20, 60]);
  assert.equal(result.volume.enabled, true);
});

test("trend preset enables EMA 20/60 and MACD 12/26/9", () => {
  const result = applyIndicatorPreset(settings(), "TREND");

  assert.equal(result.ma.enabled, true);
  assert.equal(result.ma.type, "EMA");
  assert.deepEqual(result.ma.lines.map((line) => line.period), [20, 60]);
  assert.equal(result.macd.enabled, true);
  assert.deepEqual(
    [result.macd.fastPeriod, result.macd.slowPeriod, result.macd.signalPeriod],
    [12, 26, 9],
  );
});

test("momentum preset enables RSI 14", () => {
  const result = applyIndicatorPreset(settings(), "MOMENTUM");

  assert.equal(result.rsi.enabled, true);
  assert.equal(result.rsi.period, 14);
});

test("volatility preset enables Bollinger 20/2", () => {
  const result = applyIndicatorPreset(settings(), "VOLATILITY");

  assert.equal(result.bollinger.enabled, true);
  assert.equal(result.bollinger.period, 20);
  assert.equal(result.bollinger.multiplier, 2);
});

test("presets preserve settings they do not define", () => {
  const current = settings();
  current.volume.enabled = false;
  current.bollinger.enabled = true;
  current.bollinger.period = 31;
  current.macd.enabled = true;
  current.macd.fastPeriod = 8;

  const result = applyIndicatorPreset(current, "MOMENTUM");

  assert.deepEqual(result.volume, current.volume);
  assert.deepEqual(result.bollinger, current.bollinger);
  assert.deepEqual(result.macd, current.macd);
});

test("preset result remains editable and does not mutate the source", () => {
  const current = settings();
  const preset = applyIndicatorPreset(current, "MOMENTUM");
  const customized = {
    ...preset,
    rsi: { ...preset.rsi, period: 9 },
  };

  assert.equal(customized.rsi.period, 9);
  assert.equal(preset.rsi.period, 14);
  assert.equal(current.rsi.enabled, false);
});

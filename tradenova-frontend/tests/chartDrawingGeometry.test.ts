import assert from "node:assert/strict";
import test from "node:test";
import {
  FIBONACCI_LEVELS,
  getFibonacciLevels,
  getParallelChannelGeometry,
  getRayEndpoint,
  normalizeZoneRect,
} from "../src/components/training/chart/drawing/drawingGeometry.ts";

test("ray extends in its anchor direction and rejects a vertical direction", () => {
  assert.deepEqual(getRayEndpoint({ x: 10, y: 10 }, { x: 20, y: 20 }, 100), { x: 100, y: 100 });
  assert.deepEqual(getRayEndpoint({ x: 90, y: 10 }, { x: 80, y: 20 }, 100), { x: 0, y: 100 });
  assert.deepEqual(getRayEndpoint({ x: 10, y: 20 }, { x: 20, y: 20 }, 100), { x: 100, y: 20 });
  assert.equal(getRayEndpoint({ x: 10, y: 10 }, { x: 10, y: 20 }, 100), null);
});

test("fibonacci produces seven exact levels for upward, downward, and flat ranges", () => {
  assert.deepEqual(getFibonacciLevels(100, 200).map((level) => level.ratio), [...FIBONACCI_LEVELS]);
  assert.equal(getFibonacciLevels(100, 200)[3].price, 150);
  assert.equal(getFibonacciLevels(200, 100)[3].price, 150);
  assert.ok(getFibonacciLevels(100, 100).every((level) => level.price === 100));
});

test("parallel channel uses the perpendicular component of anchor three", () => {
  const rising = getParallelChannelGeometry({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 });
  assert.ok(rising);
  assert.equal(rising.parallelEnd.x - rising.parallelStart.x, 10);
  assert.equal(rising.parallelEnd.y - rising.parallelStart.y, 10);
  assert.deepEqual(getParallelChannelGeometry({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: -4 })?.offset, { x: 0, y: -4 });
  assert.deepEqual(getParallelChannelGeometry({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 4 })?.offset, { x: 0, y: 4 });
  assert.equal(getParallelChannelGeometry({ x: 0, y: 0 }, { x: 0.01, y: 0.01 }, { x: 1, y: 1 }), null);
});

test("zone normalization supports reversed anchors", () => {
  assert.deepEqual(normalizeZoneRect({ x: 20, y: 30 }, { x: 10, y: 5 }), { x: 10, y: 5, width: 10, height: 25 });
});

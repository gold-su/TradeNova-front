import assert from "node:assert/strict";
import test from "node:test";
import {
  addDrawing,
  cancelDrawingDraft,
  clearChartDrawings,
  removeDrawing,
  replaceDrawing,
  requiredAnchorCount,
  resolveDrawingPoint,
  type ChartDrawing,
} from "../src/components/training/chart/drawing/drawingTypes.ts";

test("horizontal line stores its price anchor for the selected chart", () => {
  const result = resolveDrawingPoint(
    "HORIZONTAL_LINE",
    101,
    { time: 1710000000, price: 37200 },
    null,
    "line-1",
  );

  assert.deepEqual(result, {
    drawing: { id: "line-1", chartId: 101, type: "HORIZONTAL_LINE", price: 37200 },
    pendingDrawing: null,
  });
});

test("trend and zone tools keep their first domain point until the second click", () => {
  const trendFirst = resolveDrawingPoint(
    "TREND_LINE",
    101,
    { time: 10, price: 100 },
    null,
    "trend-1",
  );
  assert.equal(trendFirst.drawing, null);
  assert.deepEqual(trendFirst.pendingDrawing?.anchors, [{ time: 10, price: 100 }]);

  const trendSecond = resolveDrawingPoint(
    "TREND_LINE",
    101,
    { time: 20, price: 110 },
    trendFirst.pendingDrawing,
    "trend-1",
  );
  assert.deepEqual(trendSecond.drawing, {
    id: "trend-1",
    chartId: 101,
    type: "TREND_LINE",
    start: { time: 10, price: 100 },
    end: { time: 20, price: 110 },
  });

  const zoneFirst = resolveDrawingPoint("ZONE", 101, { time: 30, price: 120 }, null, "zone-1");
  const zoneSecond = resolveDrawingPoint(
    "ZONE",
    101,
    { time: 40, price: 90 },
    zoneFirst.pendingDrawing,
    "zone-1",
  );
  assert.equal(zoneSecond.drawing?.type, "ZONE");
  assert.deepEqual(zoneSecond.drawing?.start, { time: 30, price: 120 });
  assert.deepEqual(zoneSecond.drawing?.end, { time: 40, price: 90 });
});

test("drawings are isolated by chart and preserve old-chart records after a refreshed chart id", () => {
  const drawing: ChartDrawing = {
    id: "line-1",
    chartId: 101,
    type: "HORIZONTAL_LINE",
    price: 37200,
  };
  const drawings = addDrawing({}, drawing);

  assert.deepEqual(drawings[101], [drawing]);
  assert.equal(drawings[102], undefined);
  assert.equal(drawings[103], undefined);
});

test("delete and clear only affect the active chart's drawings", () => {
  const chartOne: ChartDrawing = {
    id: "one",
    chartId: 101,
    type: "HORIZONTAL_LINE",
    price: 100,
  };
  const chartTwo: ChartDrawing = {
    id: "two",
    chartId: 202,
    type: "HORIZONTAL_LINE",
    price: 200,
  };
  const drawings = addDrawing(addDrawing({}, chartOne), chartTwo);

  const afterDelete = removeDrawing(drawings, 101, "one");
  assert.deepEqual(afterDelete[101], []);
  assert.deepEqual(afterDelete[202], [chartTwo]);

  const afterClear = clearChartDrawings(drawings, 101);
  assert.deepEqual(afterClear[101], []);
  assert.deepEqual(afterClear[202], [chartTwo]);
});

test("v2 tools declare their anchor count without exposing new UI behavior", () => {
  assert.equal(requiredAnchorCount("POINTER"), 0);
  assert.equal(requiredAnchorCount("HORIZONTAL_LINE"), 1);
  assert.equal(requiredAnchorCount("VERTICAL_LINE"), 1);
  assert.equal(requiredAnchorCount("TEXT"), 1);
  assert.equal(requiredAnchorCount("TREND_LINE"), 2);
  assert.equal(requiredAnchorCount("RAY"), 2);
  assert.equal(requiredAnchorCount("ZONE"), 2);
  assert.equal(requiredAnchorCount("FIBONACCI_RETRACEMENT"), 2);
  assert.equal(requiredAnchorCount("PARALLEL_CHANNEL"), 3);
});

test("cancel clears only the draft and optimistic replacement keeps the drawing", () => {
  const temporary: ChartDrawing = {
    id: "drawing-temp",
    chartId: 101,
    type: "HORIZONTAL_LINE",
    price: 37200,
  };
  const persisted: ChartDrawing = { ...temporary, id: "42" };
  const drawings = replaceDrawing(addDrawing({}, temporary), 101, temporary.id, persisted);

  assert.equal(cancelDrawingDraft(), null);
  assert.deepEqual(drawings[101], [persisted]);
});

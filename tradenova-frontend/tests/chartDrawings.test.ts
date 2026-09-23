import assert from "node:assert/strict";
import test from "node:test";
import {
  addDrawing,
  cancelDrawingDraft,
  clearChartDrawings,
  removeDrawing,
  replaceDrawing,
  mergeHydratedDrawings,
  requiredAnchorCount,
  resolveDrawingPoint,
  resolveTextDrawing,
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

test("advanced tools commit at their required anchor count", () => {
  const point1 = { time: 10, price: 100 } as const;
  const point2 = { time: 20, price: 110 } as const;
  const point3 = { time: 30, price: 120 } as const;

  assert.equal(resolveDrawingPoint("VERTICAL_LINE", 1, point1, null, "v").drawing?.type, "VERTICAL_LINE");
  for (const tool of ["RAY", "FIBONACCI_RETRACEMENT"] as const) {
    const first = resolveDrawingPoint(tool, 1, point1, null, tool);
    assert.equal(first.drawing, null);
    assert.equal(resolveDrawingPoint(tool, 1, point2, first.pendingDrawing, tool).drawing?.type, tool);
  }
  const first = resolveDrawingPoint("PARALLEL_CHANNEL", 1, point1, null, "parallel");
  const second = resolveDrawingPoint("PARALLEL_CHANNEL", 1, point2, first.pendingDrawing, "parallel");
  assert.equal(second.drawing, null);
  assert.equal(resolveDrawingPoint("PARALLEL_CHANNEL", 1, point3, second.pendingDrawing, "parallel").drawing?.type, "PARALLEL_CHANNEL");
});

test("text trims content and rejects empty or oversized values", () => {
  const draft = resolveDrawingPoint("TEXT", 1, { time: 10, price: 100 }, null, "text").pendingDrawing;
  assert.equal(resolveTextDrawing(draft, "   ", "text"), null);
  assert.equal(resolveTextDrawing(draft, "x".repeat(501), "text"), null);
  assert.deepEqual(resolveTextDrawing(draft, "  support  ", "text"), {
    id: "text",
    chartId: 1,
    type: "TEXT",
    anchor: { time: 10, price: 100 },
    text: "support",
    options: null,
  });
});

test("optimistic replacement and rollback work for every advanced drawing union", () => {
  const point = { time: 10, price: 100 } as const;
  const next = { time: 20, price: 110 } as const;
  const third = { time: 30, price: 120 } as const;
  const drawings: ChartDrawing[] = [
    { id: "temp-v", chartId: 1, type: "VERTICAL_LINE", time: point.time },
    { id: "temp-r", chartId: 1, type: "RAY", start: point, end: next },
    { id: "temp-f", chartId: 1, type: "FIBONACCI_RETRACEMENT", start: point, end: next },
    { id: "temp-p", chartId: 1, type: "PARALLEL_CHANNEL", start: point, end: next, anchor3: third },
    { id: "temp-t", chartId: 1, type: "TEXT", anchor: point, text: "note", options: null },
  ];

  let state: Record<number, ChartDrawing[]> = {};
  drawings.forEach((drawing) => { state = addDrawing(state, drawing); });
  drawings.forEach((drawing, index) => {
    state = replaceDrawing(state, 1, drawing.id, { ...drawing, id: String(index + 1) });
  });
  assert.deepEqual(state[1].map((drawing) => drawing.id), ["1", "2", "3", "4", "5"]);
  assert.equal(removeDrawing(state, 1, "3")[1].some((drawing) => drawing.id === "3"), false);
});

test("late session hydration cannot erase an optimistic or newly persisted drawing", () => {
  const optimistic: ChartDrawing = {
    id: "drawing-pending",
    chartId: 101,
    type: "VERTICAL_LINE",
    time: 10,
  };
  const existing: ChartDrawing = {
    id: "7",
    chartId: 101,
    type: "HORIZONTAL_LINE",
    price: 100,
  };

  const merged = mergeHydratedDrawings(
    addDrawing({}, optimistic),
    { 101: [existing] },
  );
  assert.deepEqual(merged[101], [existing, optimistic]);

  const persisted = { ...optimistic, id: "8" };
  const replaced = replaceDrawing(merged, 101, optimistic.id, persisted);
  assert.deepEqual(replaced[101], [existing, persisted]);

  const hydrationWonRace = mergeHydratedDrawings(
    addDrawing({}, optimistic),
    { 101: [persisted] },
  );
  const deduplicated = replaceDrawing(hydrationWonRace, 101, optimistic.id, persisted);
  assert.deepEqual(deduplicated[101], [persisted]);
});

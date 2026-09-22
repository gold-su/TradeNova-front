import assert from "node:assert/strict";
import test from "node:test";
import { fromApiDrawing, toCreateRequest } from "../src/components/training/chart/drawing/drawingApiMapper.ts";

test("persisted trend replacement retains lightweight-charts seconds anchors", () => {
  const drawing = fromApiDrawing({ id: 123, chartId: 7, type: "TREND_LINE", startDate: "2026-09-22", startPrice: 100, endDate: "2026-09-23", endPrice: 110 });
  assert.equal(drawing.type, "TREND_LINE");
  if (drawing.type !== "TREND_LINE") return;
  // Backend candles use Asia/Seoul midnight, which is 15:00 UTC on the prior day.
  assert.equal(drawing.start.time, 1_790_002_800);
  assert.equal(toCreateRequest(drawing).startDate, "2026-09-22");
  assert.equal(toCreateRequest(drawing).endDate, "2026-09-23");
});

test("persisted horizontal drawing has no date anchor and keeps its price", () => {
  const drawing = fromApiDrawing({ id: 9, chartId: 7, type: "HORIZONTAL_LINE", startDate: null, startPrice: 37200, endDate: null, endPrice: null });
  assert.deepEqual(drawing, { id: "9", chartId: 7, type: "HORIZONTAL_LINE", price: 37200 });
});

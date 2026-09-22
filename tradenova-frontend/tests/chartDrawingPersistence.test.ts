import assert from "node:assert/strict";
import test from "node:test";
import { fromApiDrawing, toCreateRequest, type ChartDrawingApiResponse } from "../src/components/training/chart/drawing/drawingApiMapper.ts";

const api = (value: Partial<ChartDrawingApiResponse> & Pick<ChartDrawingApiResponse, "id" | "chartId" | "type">): ChartDrawingApiResponse => ({ startDate: null, startPrice: null, endDate: null, endPrice: null, anchor3Date: null, anchor3Price: null, textContent: null, optionsJson: null, ...value });

test("persisted trend replacement retains lightweight-charts seconds anchors", () => {
  const drawing = fromApiDrawing(api({ id: 123, chartId: 7, type: "TREND_LINE", startDate: "2026-09-22", startPrice: 100, endDate: "2026-09-23", endPrice: 110 }));
  assert.equal(drawing.type, "TREND_LINE");
  if (drawing.type !== "TREND_LINE") return;
  // Backend candles use Asia/Seoul midnight, which is 15:00 UTC on the prior day.
  assert.equal(drawing.start.time, 1_790_002_800);
  assert.equal(toCreateRequest(drawing).startDate, "2026-09-22");
  assert.equal(toCreateRequest(drawing).endDate, "2026-09-23");
});

test("persisted horizontal drawing has no date anchor and keeps its price", () => {
  const drawing = fromApiDrawing(api({ id: 9, chartId: 7, type: "HORIZONTAL_LINE", startPrice: 37200 }));
  assert.deepEqual(drawing, { id: "9", chartId: 7, type: "HORIZONTAL_LINE", price: 37200 });
});

test("v2 response variants map and round-trip through the shared Seoul helper", () => {
  const vertical = fromApiDrawing(api({ id: 1, chartId: 7, type: "VERTICAL_LINE", startDate: "2026-09-22" }));
  assert.equal(toCreateRequest(vertical).startDate, "2026-09-22");
  const parallel = fromApiDrawing(api({ id: 2, chartId: 7, type: "PARALLEL_CHANNEL", startDate: "2026-09-22", startPrice: 100, endDate: "2026-09-23", endPrice: 110, anchor3Date: "2026-09-24", anchor3Price: 120 }));
  assert.equal(toCreateRequest(parallel).anchor3Date, "2026-09-24");
  const text = fromApiDrawing(api({ id: 3, chartId: 7, type: "TEXT", startDate: "2026-09-22", startPrice: 100, textContent: "support" }));
  assert.equal(toCreateRequest(text).textContent, "support");
});

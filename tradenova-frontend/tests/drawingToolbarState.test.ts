import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowDrawingRail } from "../src/components/training/chart/drawing/drawingToolbarState.ts";

test("grid never shows a drawing rail while single does", () => {
  assert.equal(shouldShowDrawingRail(false), false);
  assert.equal(shouldShowDrawingRail(true), true);
});

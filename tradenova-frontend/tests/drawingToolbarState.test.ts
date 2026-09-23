import assert from "node:assert/strict";
import test from "node:test";
import { drawingGroupForTool, reduceDrawingFlyout, shouldShowDrawingRail } from "../src/components/training/chart/drawing/drawingToolbarState.ts";

test("line and axis groups open, toggle, and close on selection, outside click, or escape", () => {
  assert.equal(reduceDrawingFlyout(null, { type: "TOGGLE", flyout: "LINE" }), "LINE");
  assert.equal(reduceDrawingFlyout("LINE", { type: "TOGGLE", flyout: "LINE" }), null);
  assert.equal(reduceDrawingFlyout("LINE", { type: "TOGGLE", flyout: "AXIS" }), "AXIS");
  assert.equal(reduceDrawingFlyout("AXIS", { type: "SELECT" }), null);
  assert.equal(reduceDrawingFlyout("LINE", { type: "OUTSIDE" }), null);
  assert.equal(reduceDrawingFlyout("LINE", { type: "ESCAPE" }), null);
});

test("active group follows the selected tool", () => {
  assert.equal(drawingGroupForTool("TREND_LINE"), "LINE");
  assert.equal(drawingGroupForTool("RAY"), "LINE");
  assert.equal(drawingGroupForTool("HORIZONTAL_LINE"), "AXIS");
  assert.equal(drawingGroupForTool("VERTICAL_LINE"), "AXIS");
  assert.equal(drawingGroupForTool("POINTER"), "POINTER");
});

test("grid never shows a drawing rail while single does", () => {
  assert.equal(shouldShowDrawingRail(false), false);
  assert.equal(shouldShowDrawingRail(true), true);
});

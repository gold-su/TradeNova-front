import type { DrawingTool } from "./drawingTypes";

export type DrawingFlyout = "LINE" | "AXIS" | null;
export type DrawingFlyoutEvent =
  | { type: "TOGGLE"; flyout: Exclude<DrawingFlyout, null> }
  | { type: "SELECT" }
  | { type: "OUTSIDE" }
  | { type: "ESCAPE" };

export function reduceDrawingFlyout(state: DrawingFlyout, event: DrawingFlyoutEvent): DrawingFlyout {
  if (event.type === "TOGGLE") return state === event.flyout ? null : event.flyout;
  return null;
}

export function drawingGroupForTool(tool: DrawingTool): "POINTER" | "LINE" | "AXIS" | "SHAPE" | "CHANNEL" | "ANALYSIS" | "ANNOTATION" {
  if (tool === "TREND_LINE" || tool === "RAY") return "LINE";
  if (tool === "HORIZONTAL_LINE" || tool === "VERTICAL_LINE") return "AXIS";
  if (tool === "ZONE") return "SHAPE";
  if (tool === "PARALLEL_CHANNEL") return "CHANNEL";
  if (tool === "FIBONACCI_RETRACEMENT") return "ANALYSIS";
  if (tool === "TEXT") return "ANNOTATION";
  return "POINTER";
}

export function shouldShowDrawingRail(single: boolean) {
  return single;
}

import type { UTCTimestamp } from "lightweight-charts";

export type DrawingType = "HORIZONTAL_LINE" | "VERTICAL_LINE" | "TREND_LINE" | "RAY" | "ZONE" | "PARALLEL_CHANNEL" | "FIBONACCI_RETRACEMENT" | "TEXT";
export type DrawingTool = "POINTER" | DrawingType;
export type DrawingPoint = { time: UTCTimestamp; price: number };
type DrawingBase = { id: string; chartId: number };
export type HorizontalLineDrawing = DrawingBase & { type: "HORIZONTAL_LINE"; price: number };
export type VerticalLineDrawing = DrawingBase & { type: "VERTICAL_LINE"; time: UTCTimestamp };
type TwoAnchorDrawingType = "TREND_LINE" | "RAY" | "ZONE" | "FIBONACCI_RETRACEMENT";
export type TwoAnchorDrawing<T extends TwoAnchorDrawingType = TwoAnchorDrawingType> = T extends TwoAnchorDrawingType
  ? DrawingBase & { type: T; start: DrawingPoint; end: DrawingPoint }
  : never;
export type ParallelChannelDrawing = DrawingBase & { type: "PARALLEL_CHANNEL"; start: DrawingPoint; end: DrawingPoint; anchor3: DrawingPoint };
export type TextDrawing = DrawingBase & { type: "TEXT"; anchor: DrawingPoint; text: string; options?: string | null };
export type ChartDrawing = HorizontalLineDrawing | VerticalLineDrawing | TwoAnchorDrawing | ParallelChannelDrawing | TextDrawing;
export type SelectedDrawing = { chartId: number; drawingId: string } | null;
export type DrawingDraft = { chartId: number; tool: DrawingType; anchors: DrawingPoint[] };
export type PendingDrawing = DrawingDraft | null;
export const MAX_DRAWING_TEXT_LENGTH = 500;

export function requiredAnchorCount(tool: DrawingTool) {
  if (tool === "POINTER") return 0;
  if (tool === "HORIZONTAL_LINE" || tool === "VERTICAL_LINE" || tool === "TEXT") return 1;
  return tool === "PARALLEL_CHANNEL" ? 3 : 2;
}
export function createDrawingId() { return `drawing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
export function resolveDrawingPoint(tool: DrawingTool, chartId: number, point: DrawingPoint, draft: PendingDrawing, id = createDrawingId()): { drawing: ChartDrawing | null; pendingDrawing: PendingDrawing } {
  if (tool === "POINTER") return { drawing: null, pendingDrawing: null };
  const anchors = draft?.chartId === chartId && draft.tool === tool ? [...draft.anchors, point] : [point];
  if (anchors.length < requiredAnchorCount(tool) || tool === "TEXT") return { drawing: null, pendingDrawing: { chartId, tool, anchors } };
  const base = { id, chartId };
  if (tool === "HORIZONTAL_LINE") return { drawing: { ...base, type: tool, price: point.price }, pendingDrawing: null };
  if (tool === "VERTICAL_LINE") return { drawing: { ...base, type: tool, time: point.time }, pendingDrawing: null };
  if (tool === "PARALLEL_CHANNEL") return { drawing: { ...base, type: tool, start: anchors[0], end: anchors[1], anchor3: anchors[2] }, pendingDrawing: null };
  return { drawing: { ...base, type: tool, start: anchors[0], end: anchors[1] }, pendingDrawing: null };
}
export function addDrawing(state: Record<number, ChartDrawing[]>, drawing: ChartDrawing) { return { ...state, [drawing.chartId]: [...(state[drawing.chartId] ?? []), drawing] }; }
export function replaceDrawing(state: Record<number, ChartDrawing[]>, chartId: number, drawingId: string, replacement: ChartDrawing) { return { ...state, [chartId]: (state[chartId] ?? []).map(drawing => drawing.id === drawingId ? replacement : drawing) }; }
export function removeDrawing(state: Record<number, ChartDrawing[]>, chartId: number, drawingId: string) { return { ...state, [chartId]: (state[chartId] ?? []).filter(d => d.id !== drawingId) }; }
export function clearChartDrawings(state: Record<number, ChartDrawing[]>, chartId: number) { return { ...state, [chartId]: [] }; }
export function cancelDrawingDraft(): PendingDrawing { return null; }
export function normalizeDrawingText(value: string) {
  const text = value.trim();
  return text.length > 0 && text.length <= MAX_DRAWING_TEXT_LENGTH ? text : null;
}
export function resolveTextDrawing(draft: PendingDrawing, value: string, id = createDrawingId()): TextDrawing | null {
  const text = normalizeDrawingText(value);
  const anchor = draft?.tool === "TEXT" ? draft.anchors[0] : undefined;
  return text && draft && anchor ? { id, chartId: draft.chartId, type: "TEXT", anchor, text, options: null } : null;
}

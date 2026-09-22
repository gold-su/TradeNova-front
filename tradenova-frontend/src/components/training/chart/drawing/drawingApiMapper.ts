import type { ChartDrawing, DrawingPoint } from "./drawingTypes";

export type ChartDrawingApiResponse = { id: number; chartId: number; type: "HORIZONTAL_LINE" | "TREND_LINE" | "ZONE"; startDate: string | null; startPrice: number; endDate: string | null; endPrice: number | null };
export type ChartDrawingCreateRequest = Omit<ChartDrawingApiResponse, "id" | "chartId">;
export type ChartDrawingGroupResponse = { chartId: number; drawings: ChartDrawingApiResponse[] };

function localDateToTime(date: string) { return Date.parse(`${date}T00:00:00Z`); }
function timeToLocalDate(time: number) { return new Date(time).toISOString().slice(0, 10); }

export function fromApiDrawing(drawing: ChartDrawingApiResponse): ChartDrawing {
  if (drawing.type === "HORIZONTAL_LINE") return { id: String(drawing.id), chartId: drawing.chartId, type: drawing.type, price: drawing.startPrice };
  const start: DrawingPoint = { time: localDateToTime(drawing.startDate!), price: drawing.startPrice };
  const end: DrawingPoint = { time: localDateToTime(drawing.endDate!), price: drawing.endPrice! };
  return drawing.type === "TREND_LINE" ? { id: String(drawing.id), chartId: drawing.chartId, type: drawing.type, start, end } : { id: String(drawing.id), chartId: drawing.chartId, type: drawing.type, start, end };
}
export function toCreateRequest(drawing: ChartDrawing): ChartDrawingCreateRequest {
  if (drawing.type === "HORIZONTAL_LINE") return { type: drawing.type, startDate: null, startPrice: drawing.price, endDate: null, endPrice: null };
  return { type: drawing.type, startDate: timeToLocalDate(drawing.start.time), startPrice: drawing.start.price, endDate: timeToLocalDate(drawing.end.time), endPrice: drawing.end.price };
}
export function groupDrawings(groups: ChartDrawingGroupResponse[]) { return Object.fromEntries(groups.map(group => [group.chartId, group.drawings.map(fromApiDrawing)])) as Record<number, ChartDrawing[]>; }

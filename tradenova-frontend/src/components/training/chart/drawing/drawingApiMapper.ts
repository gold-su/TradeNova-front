import type { UTCTimestamp } from "lightweight-charts";
import type { ChartDrawing, DrawingPoint, DrawingType } from "./drawingTypes";

export type ChartDrawingApiResponse = { id: number; chartId: number; type: DrawingType; startDate: string | null; startPrice: number | null; endDate: string | null; endPrice: number | null; anchor3Date: string | null; anchor3Price: number | null; textContent: string | null; optionsJson: string | null };
export type ChartDrawingCreateRequest = Omit<ChartDrawingApiResponse, "id" | "chartId">;
export type ChartDrawingGroupResponse = { chartId: number; drawings: ChartDrawingApiResponse[] };
const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
export function seoulLocalDateToChartTime(date: string) { return Math.floor(Date.parse(`${date}T00:00:00+09:00`) / 1000) as UTCTimestamp; }
export function chartTimeToSeoulLocalDate(time: UTCTimestamp) { return new Date(Number(time) * 1000 + SEOUL_OFFSET_MS).toISOString().slice(0, 10); }
const point = (date: string | null, price: number | null): DrawingPoint => ({ time: seoulLocalDateToChartTime(date!), price: price! });

export function fromApiDrawing(d: ChartDrawingApiResponse): ChartDrawing {
  const base = { id: String(d.id), chartId: d.chartId };
  if (d.type === "HORIZONTAL_LINE") return { ...base, type: d.type, price: d.startPrice! };
  if (d.type === "VERTICAL_LINE") return { ...base, type: d.type, time: seoulLocalDateToChartTime(d.startDate!) };
  if (d.type === "TEXT") return { ...base, type: d.type, anchor: point(d.startDate, d.startPrice), text: d.textContent!, options: d.optionsJson };
  const start = point(d.startDate, d.startPrice); const end = point(d.endDate, d.endPrice);
  if (d.type === "PARALLEL_CHANNEL") return { ...base, type: d.type, start, end, anchor3: point(d.anchor3Date, d.anchor3Price) };
  return { ...base, type: d.type, start, end };
}
const empty = (type: DrawingType): ChartDrawingCreateRequest => ({ type, startDate: null, startPrice: null, endDate: null, endPrice: null, anchor3Date: null, anchor3Price: null, textContent: null, optionsJson: null });
export function toCreateRequest(d: ChartDrawing): ChartDrawingCreateRequest {
  const body = empty(d.type);
  if (d.type === "HORIZONTAL_LINE") return { ...body, startPrice: d.price };
  if (d.type === "VERTICAL_LINE") return { ...body, startDate: chartTimeToSeoulLocalDate(d.time) };
  if (d.type === "TEXT") return { ...body, startDate: chartTimeToSeoulLocalDate(d.anchor.time), startPrice: d.anchor.price, textContent: d.text, optionsJson: d.options ?? null };
  const anchors = { startDate: chartTimeToSeoulLocalDate(d.start.time), startPrice: d.start.price, endDate: chartTimeToSeoulLocalDate(d.end.time), endPrice: d.end.price };
  return d.type === "PARALLEL_CHANNEL" ? { ...body, ...anchors, anchor3Date: chartTimeToSeoulLocalDate(d.anchor3.time), anchor3Price: d.anchor3.price } : { ...body, ...anchors };
}
export function groupDrawings(groups: ChartDrawingGroupResponse[]) { return Object.fromEntries(groups.map(g => [g.chartId, g.drawings.map(fromApiDrawing)])) as Record<number, ChartDrawing[]>; }

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import { getFibonacciLevels, getParallelChannelGeometry, getRayEndpoint, normalizeZoneRect, type PixelPoint } from "./drawingGeometry";
import { MAX_DRAWING_TEXT_LENGTH, type ChartDrawing, type DrawingPoint, type DrawingTool, type PendingDrawing, type SelectedDrawing } from "./drawingTypes";

type Props = {
  chart: IChartApi | null;
  candleSeries: ISeriesApi<"Candlestick"> | null;
  chartId: number;
  drawings: ChartDrawing[];
  tool: DrawingTool;
  pendingDrawing: PendingDrawing;
  selectedDrawing: SelectedDrawing;
  onAddPoint: (chartId: number, point: DrawingPoint) => void;
  onCommitText: (value: string) => boolean;
  onCancelDraft: () => void;
  onSelectDrawing: (selection: SelectedDrawing) => void;
  editingEnabled: boolean;
};

function toPixel(chart: IChartApi, series: ISeriesApi<"Candlestick">, point: DrawingPoint): PixelPoint | null {
  const x = chart.timeScale().timeToCoordinate(point.time as never);
  const y = series.priceToCoordinate(point.price);
  return x == null || y == null ? null : { x, y };
}

function FibonacciLines({ start, end, startPrice, endPrice, stroke, dashed = false }: { start: PixelPoint; end: PixelPoint; startPrice: number; endPrice: number; stroke: string; dashed?: boolean }) {
  const left = Math.min(start.x, end.x);
  const right = Math.max(start.x, end.x);
  return getFibonacciLevels(startPrice, endPrice).map(({ ratio, price }) => {
    const y = start.y + (end.y - start.y) * ratio;
    return <g key={ratio}><line x1={left} y1={y} x2={right} y2={y} stroke={stroke} strokeWidth={1} strokeOpacity={0.8} strokeDasharray={dashed ? "5 4" : undefined} /><text x={left + 4} y={y - 3} fill={stroke} fontSize="9">{ratio} · {Math.round(price).toLocaleString()}</text></g>;
  });
}

export function DrawingOverlay({ chart, candleSeries, chartId, drawings, tool, pendingDrawing, selectedDrawing, onAddPoint, onCommitText, onCancelDraft, onSelectDrawing, editingEnabled }: Props) {
  const pointerRef = useRef<DrawingPoint | null>(null);
  const frameRef = useRef<number | null>(null);
  const [previewPoint, setPreviewPoint] = useState<DrawingPoint | null>(null);
  const [textValue, setTextValue] = useState("");
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!chart) return;
    const update = () => {
      const dimensions = chart.chartElement().getBoundingClientRect();
      setSize({ width: dimensions.width, height: dimensions.height });
      setRevision((value) => value + 1);
    };
    update();
    chart.timeScale().subscribeVisibleLogicalRangeChange(update);
    chart.subscribeCrosshairMove(update);
    const observer = new ResizeObserver(update);
    observer.observe(chart.chartElement());
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(update);
      chart.unsubscribeCrosshairMove(update);
      observer.disconnect();
    };
  }, [chart]);
  useEffect(() => () => { if (frameRef.current != null) cancelAnimationFrame(frameRef.current); }, []);

  const textDraft = pendingDrawing?.chartId === chartId && pendingDrawing.tool === "TEXT" ? pendingDrawing : null;
  const textAnchor = chart && candleSeries && textDraft?.anchors[0] ? toPixel(chart, candleSeries, textDraft.anchors[0]) : null;
  if (!chart || !candleSeries || size.width <= 0 || size.height <= 0) return null;

  const pointFromEvent = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const time = chart.timeScale().coordinateToTime(event.clientX - rect.left);
    const price = candleSeries.coordinateToPrice(event.clientY - rect.top);
    if (time == null || price == null || typeof time !== "number") return null;
    return { time, price };
  };

  const renderPreview = () => {
    if (!previewPoint) return null;
    if (tool === "HORIZONTAL_LINE") {
      const y = candleSeries.priceToCoordinate(previewPoint.price);
      return y == null ? null : <line x1={0} y1={y} x2={size.width} y2={y} stroke="#5eead4" strokeOpacity={0.45} strokeDasharray="4 4" />;
    }
    if (tool === "VERTICAL_LINE") {
      const x = chart.timeScale().timeToCoordinate(previewPoint.time as never);
      return x == null ? null : <line x1={x} y1={0} x2={x} y2={size.height} stroke="#5eead4" strokeOpacity={0.45} strokeDasharray="4 4" />;
    }
    const draft = pendingDrawing?.chartId === chartId ? pendingDrawing : null;
    if (!draft?.anchors[0] || draft.tool === "TEXT") return null;
    const start = toPixel(chart, candleSeries, draft.anchors[0]);
    const endPoint = draft.anchors[1] ?? previewPoint;
    const end = toPixel(chart, candleSeries, endPoint);
    if (!start || !end) return null;
    if (draft.tool === "TREND_LINE") return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" />;
    if (draft.tool === "RAY") {
      const rayEnd = getRayEndpoint(start, end, size.width);
      return rayEnd ? <line x1={start.x} y1={start.y} x2={rayEnd.x} y2={rayEnd.y} stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" /> : null;
    }
    if (draft.tool === "ZONE") return <rect {...normalizeZoneRect(start, end)} fill="rgba(94,234,212,0.08)" stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" />;
    if (draft.tool === "FIBONACCI_RETRACEMENT") return <FibonacciLines start={start} end={end} startPrice={draft.anchors[0].price} endPrice={endPoint.price} stroke="#5eead4" dashed />;
    if (draft.tool === "PARALLEL_CHANNEL") {
      if (!draft.anchors[1]) return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" />;
      const anchor3 = toPixel(chart, candleSeries, previewPoint);
      const geometry = anchor3 && getParallelChannelGeometry(start, end, anchor3);
      if (!geometry) return null;
      const points = `${geometry.baseStart.x},${geometry.baseStart.y} ${geometry.baseEnd.x},${geometry.baseEnd.y} ${geometry.parallelEnd.x},${geometry.parallelEnd.y} ${geometry.parallelStart.x},${geometry.parallelStart.y}`;
      return <g><polygon points={points} fill="rgba(94,234,212,0.06)" /><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#5eead4" strokeDasharray="5 4" /><line x1={geometry.parallelStart.x} y1={geometry.parallelStart.y} x2={geometry.parallelEnd.x} y2={geometry.parallelEnd.y} stroke="#5eead4" strokeDasharray="5 4" /></g>;
    }
    return null;
  };

  const onTextKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") { setTextValue(""); onCancelDraft(); }
    if (event.key === "Enter" && onCommitText(textValue)) setTextValue("");
  };

  return <>
    <svg className={`absolute inset-0 z-10 ${!editingEnabled || tool === "POINTER" ? "pointer-events-none" : "cursor-crosshair"}`} data-testid={`drawing-overlay-${chartId}`} width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}
      onClick={(event) => { if (!editingEnabled || tool === "POINTER" || textDraft) return; const point = pointFromEvent(event); if (point) onAddPoint(chartId, point); }}
      onMouseMove={(event) => { if (!editingEnabled || tool === "POINTER" || textDraft) return; pointerRef.current = pointFromEvent(event); if (frameRef.current != null) return; frameRef.current = requestAnimationFrame(() => { frameRef.current = null; setPreviewPoint(pointerRef.current); }); }}>
      {renderPreview()}
      {drawings.map((drawing) => {
        const selected = selectedDrawing?.chartId === chartId && selectedDrawing.drawingId === drawing.id;
        const stroke = selected ? "#5eead4" : "#34d399";
        const click = (event: MouseEvent) => { if (tool === "POINTER") { event.stopPropagation(); onSelectDrawing({ chartId, drawingId: drawing.id }); } };
        const common = { className: editingEnabled ? "pointer-events-auto" : "pointer-events-none", onClick: click };
        if (drawing.type === "HORIZONTAL_LINE") { const y = candleSeries.priceToCoordinate(drawing.price); return y == null ? null : <g key={drawing.id} {...common}><line data-drawing-id={drawing.id} x1={0} y1={y} x2={size.width} y2={y} stroke="transparent" strokeWidth={12} /><line x1={0} y1={y} x2={size.width} y2={y} stroke={stroke} strokeWidth={selected ? 2 : 1.5} strokeDasharray="5 4" /><text x={6} y={y - 5} fill={stroke} fontSize="10">{drawing.price.toLocaleString()}</text></g>; }
        if (drawing.type === "VERTICAL_LINE") { const x = chart.timeScale().timeToCoordinate(drawing.time as never); return x == null ? null : <g key={drawing.id} {...common}><line data-drawing-id={drawing.id} x1={x} y1={0} x2={x} y2={size.height} stroke="transparent" strokeWidth={12} /><line x1={x} y1={0} x2={x} y2={size.height} stroke={stroke} strokeWidth={selected ? 2 : 1.5} strokeDasharray="5 4" /></g>; }
        if (drawing.type === "TEXT") { const anchor = toPixel(chart, candleSeries, drawing.anchor); return anchor ? <text key={drawing.id} data-drawing-id={drawing.id} {...common} x={anchor.x + 4} y={anchor.y - 4} fill={stroke} fontSize="12" fontWeight={selected ? 600 : 500}>{drawing.text}</text> : null; }
        const start = toPixel(chart, candleSeries, drawing.start); const end = toPixel(chart, candleSeries, drawing.end);
        if (!start || !end) return null;
        if (drawing.type === "TREND_LINE") return <g key={drawing.id} {...common}><line data-drawing-id={drawing.id} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth={12} /><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth={selected ? 2 : 1.5} /></g>;
        if (drawing.type === "RAY") { const rayEnd = getRayEndpoint(start, end, size.width); return rayEnd ? <g key={drawing.id} {...common}><line data-drawing-id={drawing.id} x1={start.x} y1={start.y} x2={rayEnd.x} y2={rayEnd.y} stroke="transparent" strokeWidth={12} /><line x1={start.x} y1={start.y} x2={rayEnd.x} y2={rayEnd.y} stroke={stroke} strokeWidth={selected ? 2 : 1.5} /></g> : null; }
        if (drawing.type === "ZONE") return <rect key={drawing.id} data-drawing-id={drawing.id} {...common} {...normalizeZoneRect(start, end)} fill="rgba(52,211,153,0.10)" stroke={stroke} strokeWidth={selected ? 2 : 1.25} />;
        if (drawing.type === "FIBONACCI_RETRACEMENT") return <g key={drawing.id} data-drawing-id={drawing.id} {...common}><FibonacciLines start={start} end={end} startPrice={drawing.start.price} endPrice={drawing.end.price} stroke={stroke} /></g>;
        const anchor3 = toPixel(chart, candleSeries, drawing.anchor3); const geometry = anchor3 && getParallelChannelGeometry(start, end, anchor3);
        if (!geometry) return null;
        const points = `${geometry.baseStart.x},${geometry.baseStart.y} ${geometry.baseEnd.x},${geometry.baseEnd.y} ${geometry.parallelEnd.x},${geometry.parallelEnd.y} ${geometry.parallelStart.x},${geometry.parallelStart.y}`;
        return <g key={drawing.id} data-drawing-id={drawing.id} {...common}><polygon points={points} fill="rgba(52,211,153,0.08)" stroke="transparent" /><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth={selected ? 2 : 1.25} /><line x1={geometry.parallelStart.x} y1={geometry.parallelStart.y} x2={geometry.parallelEnd.x} y2={geometry.parallelEnd.y} stroke={stroke} strokeWidth={selected ? 2 : 1.25} /></g>;
      })}
    </svg>
    {editingEnabled && textAnchor && <input autoFocus value={textValue} maxLength={MAX_DRAWING_TEXT_LENGTH} aria-label="차트 텍스트 입력" placeholder="텍스트 입력 후 Enter" onChange={(event) => setTextValue(event.target.value)} onKeyDown={onTextKeyDown} onBlur={() => { if (onCommitText(textValue)) setTextValue(""); else { setTextValue(""); onCancelDraft(); } }} className="absolute z-20 h-8 w-48 rounded-md border border-primary/50 bg-background/95 px-2 text-xs text-foreground shadow-lg outline-none focus:ring-1 focus:ring-primary" style={{ left: Math.min(textAnchor.x + 6, Math.max(0, size.width - 198)), top: Math.min(textAnchor.y + 6, Math.max(0, size.height - 38)) }} />}
  </>;
}

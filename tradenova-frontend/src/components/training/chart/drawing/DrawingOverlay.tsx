import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { IChartApi, ISeriesApi } from "lightweight-charts";
import type { ChartDrawing, DrawingPoint, DrawingTool, PendingDrawing, SelectedDrawing } from "./drawingTypes";

type Props = {
  chart: IChartApi | null;
  candleSeries: ISeriesApi<"Candlestick"> | null;
  chartId: number;
  drawings: ChartDrawing[];
  tool: DrawingTool;
  pendingDrawing: PendingDrawing;
  selectedDrawing: SelectedDrawing;
  onAddPoint: (chartId: number, point: DrawingPoint) => void;
  onSelectDrawing: (selection: SelectedDrawing) => void;
};

type PixelPoint = { x: number; y: number };

function toPixel(chart: IChartApi, series: ISeriesApi<"Candlestick">, point: DrawingPoint): PixelPoint | null {
  const x = chart.timeScale().timeToCoordinate(point.time as never);
  const y = series.priceToCoordinate(point.price);
  return x == null || y == null ? null : { x, y };
}

export function DrawingOverlay({
  chart,
  candleSeries,
  chartId,
  drawings,
  tool,
  pendingDrawing,
  selectedDrawing,
  onAddPoint,
  onSelectDrawing,
}: Props) {
  const pointerRef = useRef<DrawingPoint | null>(null);
  const frameRef = useRef<number | null>(null);
  const [, setPreviewRevision] = useState(0);
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

  const rendered = (() => {
    if (!chart || !candleSeries) return [];
    return drawings.map((drawing) => {
      if (drawing.type === "HORIZONTAL_LINE") {
        const y = candleSeries.priceToCoordinate(drawing.price);
        return y == null ? null : { kind: "HORIZONTAL" as const, drawing, y };
      }
      const start = toPixel(chart, candleSeries, drawing.start);
      const end = toPixel(chart, candleSeries, drawing.end);
      return start && end ? { kind: "SHAPE" as const, drawing, start, end } : null;
    }).filter(Boolean) as Array<
      | { kind: "HORIZONTAL"; drawing: Extract<ChartDrawing, { type: "HORIZONTAL_LINE" }>; y: number }
      | { kind: "SHAPE"; drawing: Exclude<ChartDrawing, { type: "HORIZONTAL_LINE" }>; start: PixelPoint; end: PixelPoint }
    >;
  })();

  if (!chart || !candleSeries || size.width <= 0 || size.height <= 0) return null;

  const pointFromEvent = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const time = chart.timeScale().coordinateToTime(event.clientX - rect.left);
    const price = candleSeries.coordinateToPrice(event.clientY - rect.top);
    if (time == null || price == null || typeof time !== "number") return null;
    return { time, price };
  };

  return (
    <svg
      className={`absolute inset-0 z-10 ${tool === "POINTER" ? "pointer-events-none" : "cursor-crosshair"}`}
      data-testid={`drawing-overlay-${chartId}`}
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      onClick={(event) => {
        if (tool === "POINTER") return;
        const point = pointFromEvent(event);
        if (point) onAddPoint(chartId, point);
      }}
      onMouseMove={(event) => {
        if (tool === "POINTER") return;
        pointerRef.current = pointFromEvent(event);
        if (frameRef.current != null) return;
        frameRef.current = requestAnimationFrame(() => { frameRef.current = null; setPreviewRevision(value => value + 1); });
      }}
    >
      {tool === "HORIZONTAL_LINE" && pointerRef.current && (() => { const y = candleSeries.priceToCoordinate(pointerRef.current!.price); return y == null ? null : <line x1={0} y1={y} x2={size.width} y2={y} stroke="#5eead4" strokeOpacity={0.45} strokeDasharray="4 4" />; })()}
      {pendingDrawing?.chartId === chartId && pointerRef.current && (() => { const start = toPixel(chart, candleSeries, pendingDrawing.start); const end = toPixel(chart, candleSeries, pointerRef.current!); if (!start || !end) return null; return pendingDrawing.tool === "TREND_LINE" ? <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" /> : <rect x={Math.min(start.x,end.x)} y={Math.min(start.y,end.y)} width={Math.abs(end.x-start.x)} height={Math.abs(end.y-start.y)} fill="rgba(94,234,212,0.08)" stroke="#5eead4" strokeOpacity={0.5} strokeDasharray="5 4" />; })()}
      {rendered.map((item) => {
        const selected = selectedDrawing?.chartId === chartId && selectedDrawing.drawingId === item.drawing.id;
        const stroke = selected ? "#5eead4" : "#34d399";
        const onDrawingClick = {
          onClick: (event: MouseEvent) => {
            if (tool !== "POINTER") return;
            event.stopPropagation();
            onSelectDrawing({ chartId, drawingId: item.drawing.id });
          },
        };

        if (item.kind === "HORIZONTAL") {
          return (
            <g key={item.drawing.id} className="pointer-events-auto">
              <line data-drawing-id={item.drawing.id} x1={0} y1={item.y} x2={size.width} y2={item.y} stroke="transparent" strokeWidth={12} {...onDrawingClick} />
              <line x1={0} y1={item.y} x2={size.width} y2={item.y} stroke={stroke} strokeWidth={selected ? 2 : 1.5} strokeDasharray="5 4" {...onDrawingClick} />
              <text x={6} y={item.y - 5} fill={stroke} fontSize="10">{item.drawing.price.toLocaleString()}</text>
            </g>
          );
        }

        if (item.drawing.type === "TREND_LINE") {
          return (
            <g key={item.drawing.id} className="pointer-events-auto">
              <line data-drawing-id={item.drawing.id} x1={item.start.x} y1={item.start.y} x2={item.end.x} y2={item.end.y} stroke="transparent" strokeWidth={12} {...onDrawingClick} />
              <line x1={item.start.x} y1={item.start.y} x2={item.end.x} y2={item.end.y} stroke={stroke} strokeWidth={selected ? 2 : 1.5} {...onDrawingClick} />
              {selected && <><circle cx={item.start.x} cy={item.start.y} r={3} fill={stroke} /><circle cx={item.end.x} cy={item.end.y} r={3} fill={stroke} /></>}
            </g>
          );
        }

        const x = Math.min(item.start.x, item.end.x);
        const y = Math.min(item.start.y, item.end.y);
        const width = Math.abs(item.end.x - item.start.x);
        const height = Math.abs(item.end.y - item.start.y);
        return (
          <rect data-drawing-id={item.drawing.id} key={item.drawing.id} className="pointer-events-auto" x={x} y={y} width={width} height={height} fill="rgba(52,211,153,0.10)" stroke={stroke} strokeWidth={selected ? 2 : 1.25} onClick={onDrawingClick.onClick} />
        );
      })}
    </svg>
  );
}

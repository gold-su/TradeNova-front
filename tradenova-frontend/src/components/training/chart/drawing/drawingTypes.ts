export type DrawingTool = "POINTER" | "TREND_LINE" | "HORIZONTAL_LINE" | "ZONE";

export type DrawingPoint = {
  time: number;
  price: number;
};

type DrawingBase = {
  id: string;
  chartId: number;
};

export type HorizontalLineDrawing = DrawingBase & {
  type: "HORIZONTAL_LINE";
  price: number;
};

export type TrendLineDrawing = DrawingBase & {
  type: "TREND_LINE";
  start: DrawingPoint;
  end: DrawingPoint;
};

export type RectangleDrawing = DrawingBase & {
  type: "ZONE";
  start: DrawingPoint;
  end: DrawingPoint;
};

export type ChartDrawing =
  | HorizontalLineDrawing
  | TrendLineDrawing
  | RectangleDrawing;

export type SelectedDrawing = {
  chartId: number;
  drawingId: string;
} | null;

export type PendingDrawing = {
  chartId: number;
  tool: Exclude<DrawingTool, "POINTER" | "HORIZONTAL_LINE">;
  start: DrawingPoint;
} | null;

export function createDrawingId() {
  return "drawing-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

export function resolveDrawingPoint(
  tool: DrawingTool,
  chartId: number,
  point: DrawingPoint,
  pendingDrawing: PendingDrawing,
  id = createDrawingId(),
): { drawing: ChartDrawing | null; pendingDrawing: PendingDrawing } {
  if (tool === "POINTER") return { drawing: null, pendingDrawing: null };

  if (tool === "HORIZONTAL_LINE") {
    return {
      drawing: { id, chartId, type: "HORIZONTAL_LINE", price: point.price },
      pendingDrawing: null,
    };
  }

  if (
    !pendingDrawing ||
    pendingDrawing.chartId !== chartId ||
    pendingDrawing.tool !== tool
  ) {
    return {
      drawing: null,
      pendingDrawing: { chartId, tool, start: point },
    };
  }

  return {
    drawing:
      tool === "TREND_LINE"
        ? { id, chartId, type: "TREND_LINE", start: pendingDrawing.start, end: point }
        : { id, chartId, type: "ZONE", start: pendingDrawing.start, end: point },
    pendingDrawing: null,
  };
}

export function addDrawing(
  drawingsByChart: Record<number, ChartDrawing[]>,
  drawing: ChartDrawing,
) {
  return {
    ...drawingsByChart,
    [drawing.chartId]: [...(drawingsByChart[drawing.chartId] ?? []), drawing],
  };
}

export function removeDrawing(
  drawingsByChart: Record<number, ChartDrawing[]>,
  chartId: number,
  drawingId: string,
) {
  const remaining = (drawingsByChart[chartId] ?? []).filter(
    (drawing) => drawing.id !== drawingId,
  );
  return { ...drawingsByChart, [chartId]: remaining };
}

export function clearChartDrawings(
  drawingsByChart: Record<number, ChartDrawing[]>,
  chartId: number,
) {
  return { ...drawingsByChart, [chartId]: [] };
}

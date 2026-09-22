import { useCallback, useState } from "react";
import {
  addDrawing,
  clearChartDrawings,
  createDrawingId,
  removeDrawing,
  resolveDrawingPoint,
  type ChartDrawing,
  type DrawingPoint,
  type DrawingTool,
  type PendingDrawing,
  type SelectedDrawing,
} from "./drawingTypes";

export function useChartDrawings() {
  const [drawingsByChart, setDrawingsByChart] = useState<Record<number, ChartDrawing[]>>({});
  const [tool, setTool] = useState<DrawingTool>("POINTER");
  const [selectedDrawing, setSelectedDrawing] = useState<SelectedDrawing>(null);
  const [pendingDrawing, setPendingDrawing] = useState<PendingDrawing>(null);

  const selectTool = useCallback((nextTool: DrawingTool) => {
    setTool(nextTool);
    setPendingDrawing(null);
    if (nextTool !== "POINTER") setSelectedDrawing(null);
  }, []);

  const addPoint = useCallback((chartId: number, point: DrawingPoint) => {
    if (tool === "POINTER") return;

    const result = resolveDrawingPoint(
      tool,
      chartId,
      point,
      pendingDrawing,
      createDrawingId(),
    );
    setPendingDrawing(result.pendingDrawing);

    if (!result.drawing) return;

    setDrawingsByChart((prev) => addDrawing(prev, result.drawing!));
    setSelectedDrawing({ chartId, drawingId: result.drawing.id });
    setTool("POINTER");
  }, [pendingDrawing, tool]);

  const deleteSelected = useCallback(() => {
    if (!selectedDrawing) return;
    setDrawingsByChart((prev) => removeDrawing(prev, selectedDrawing.chartId, selectedDrawing.drawingId));
    setSelectedDrawing(null);
  }, [selectedDrawing]);

  const clearActiveChart = useCallback((chartId: number | null) => {
    if (chartId == null) return;
    setDrawingsByChart((prev) => clearChartDrawings(prev, chartId));
    setSelectedDrawing((selected) => selected?.chartId === chartId ? null : selected);
    setPendingDrawing((pending) => pending?.chartId === chartId ? null : pending);
  }, []);

  return { drawingsByChart, tool, selectTool, pendingDrawing, addPoint, selectedDrawing, setSelectedDrawing, deleteSelected, clearActiveChart };
}

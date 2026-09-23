import { useCallback, useEffect, useRef, useState } from "react";
import { trainingApi } from "@/api/trainingApi";
import { fromApiDrawing, groupDrawings, toCreateRequest } from "./drawingApiMapper";
import {
  addDrawing,
  cancelDrawingDraft,
  clearChartDrawings,
  createDrawingId,
  removeDrawing,
  replaceDrawing,
  mergeHydratedDrawings,
  resolveDrawingPoint,
  resolveTextDrawing,
  type ChartDrawing,
  type DrawingPoint,
  type DrawingTool,
  type PendingDrawing,
  type SelectedDrawing,
} from "./drawingTypes";

export function useChartDrawings(sessionId: number | null) {
  const [drawingsByChart, setDrawingsByChart] = useState<Record<number, ChartDrawing[]>>({});
  const [tool, setTool] = useState<DrawingTool>("POINTER");
  const [selectedDrawing, setSelectedDrawing] = useState<SelectedDrawing>(null);
  const [pendingDrawing, setPendingDrawing] = useState<PendingDrawing>(null);
  const hydratedSessionRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || hydratedSessionRef.current === sessionId) return;
    hydratedSessionRef.current = sessionId;
    trainingApi.getSessionDrawings(sessionId).then(groups => setDrawingsByChart(prev => mergeHydratedDrawings(prev, groupDrawings(groups)))).catch(() => setError("드로잉을 불러오지 못했습니다."));
  }, [sessionId]);

  const selectTool = useCallback((nextTool: DrawingTool) => {
    setTool(nextTool);
    setPendingDrawing(cancelDrawingDraft());
    if (nextTool !== "POINTER") setSelectedDrawing(null);
  }, []);

  const persistDrawing = useCallback((drawing: ChartDrawing) => {
    setDrawingsByChart((prev) => addDrawing(prev, drawing));
    setSelectedDrawing({ chartId: drawing.chartId, drawingId: drawing.id });
    setPendingDrawing(null);
    setTool("POINTER");
    trainingApi.createChartDrawing(drawing.chartId, toCreateRequest(drawing)).then((saved) => {
      const persisted = fromApiDrawing(saved);
      setDrawingsByChart(prev => replaceDrawing(prev, drawing.chartId, drawing.id, persisted));
      setSelectedDrawing((selected) => selected?.chartId === drawing.chartId && selected.drawingId === drawing.id
        ? { chartId: persisted.chartId, drawingId: persisted.id }
        : selected);
    }).catch(() => {
      setDrawingsByChart(prev => removeDrawing(prev, drawing.chartId, drawing.id));
      setError("드로잉 저장에 실패했습니다.");
    });
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

    persistDrawing(result.drawing);
  }, [pendingDrawing, persistDrawing, tool]);

  const commitText = useCallback((value: string) => {
    const drawing = resolveTextDrawing(pendingDrawing, value);
    if (!drawing) return false;
    persistDrawing(drawing);
    return true;
  }, [pendingDrawing, persistDrawing]);

  const deleteSelected = useCallback(() => {
    if (!selectedDrawing) return;
    const existing = drawingsByChart[selectedDrawing.chartId]?.find(d => d.id === selectedDrawing.drawingId);
    setDrawingsByChart((prev) => removeDrawing(prev, selectedDrawing.chartId, selectedDrawing.drawingId));
    setSelectedDrawing(null);
    if (!existing || existing.id.startsWith("drawing-")) return;
    trainingApi.deleteChartDrawing(selectedDrawing.chartId, selectedDrawing.drawingId).catch(() => { setDrawingsByChart(prev => addDrawing(prev, existing)); setError("드로잉 삭제에 실패했습니다."); });
  }, [drawingsByChart, selectedDrawing]);

  const clearActiveChart = useCallback((chartId: number | null) => {
    if (chartId == null) return;
    const existing = drawingsByChart[chartId] ?? [];
    setDrawingsByChart((prev) => clearChartDrawings(prev, chartId));
    setSelectedDrawing((selected) => selected?.chartId === chartId ? null : selected);
    setPendingDrawing((pending) => pending?.chartId === chartId ? null : pending);
    trainingApi.clearChartDrawings(chartId).catch(() => { setDrawingsByChart(prev => ({ ...prev, [chartId]: existing })); setError("드로잉 초기화에 실패했습니다."); });
  }, [drawingsByChart]);

  return { drawingsByChart, tool, selectTool, pendingDrawing, addPoint, commitText, selectedDrawing, setSelectedDrawing, deleteSelected, clearActiveChart, error, clearError: () => setError(null) };
}

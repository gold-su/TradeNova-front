import type { ProgressResponse, TrainingChartDto } from "@/types/training";

export type TrainingChartTileState = "selected" | "holding" | "default";

export function hasOpenChartPosition(
  chart: Pick<TrainingChartDto, "status">,
  progress: Pick<ProgressResponse, "chartStatus" | "positionQty"> | null,
) {
  return (
    chart.status !== "COMPLETED" &&
    progress?.chartStatus !== "COMPLETED" &&
    Number.isFinite(progress?.positionQty) &&
    (progress?.positionQty ?? 0) > 0
  );
}

export function getTrainingChartTileState(
  active: boolean,
  chart: Pick<TrainingChartDto, "status">,
  progress: Pick<ProgressResponse, "chartStatus" | "positionQty"> | null,
): TrainingChartTileState {
  if (active) return "selected";
  return hasOpenChartPosition(chart, progress) ? "holding" : "default";
}

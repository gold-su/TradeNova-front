import type { TrainingChartDto } from "@/types/training";

export function findRefreshedChart(
  charts: TrainingChartDto[],
  oldChart: TrainingChartDto,
) {
  const chartInSlot = charts.find(
    (chart) => chart.chartIndex === oldChart.chartIndex,
  );

  return chartInSlot && chartInSlot.chartId !== oldChart.chartId
    ? chartInSlot
    : null;
}

export function replaceChartKey<T>(
  values: Record<number, T>,
  oldChartId: number,
  newChartId: number,
  newValue: T,
) {
  const next = { ...values };
  delete next[oldChartId];
  next[newChartId] = newValue;
  return next;
}

export function moveChartKey<T>(
  values: Record<number, T>,
  oldChartId: number,
  newChartId: number,
) {
  const next = { ...values };
  const oldValue = next[oldChartId];
  delete next[oldChartId];
  if (oldValue !== undefined) next[newChartId] = oldValue;
  return next;
}

export function replaceActiveChartId(
  activeChartId: number | null,
  oldChartId: number,
  newChartId: number,
) {
  return activeChartId === oldChartId ? newChartId : activeChartId;
}

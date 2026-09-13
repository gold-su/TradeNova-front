export type TrainingOrderMode = "BUY" | "SELL" | null;

export function resolveReviewTargetChartId(
  currentTargetChartId: number | null,
  activeChartId: number | null,
  chartIds: number[],
) {
  if (
    currentTargetChartId != null &&
    chartIds.includes(currentTargetChartId)
  ) {
    return currentTargetChartId;
  }

  if (activeChartId != null && chartIds.includes(activeChartId)) {
    return activeChartId;
  }

  return chartIds[0] ?? null;
}

export function transitionOrderMode(
  current: TrainingOrderMode,
  event: "OPEN_BUY" | "OPEN_SELL" | "CANCEL" | "TRADE_SUCCEEDED",
): TrainingOrderMode {
  if (event === "OPEN_BUY") return "BUY";
  if (event === "OPEN_SELL") return "SELL";
  if (event === "CANCEL" || event === "TRADE_SUCCEEDED") return null;
  return current;
}

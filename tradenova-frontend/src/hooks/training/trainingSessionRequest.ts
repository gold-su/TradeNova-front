import type { CreateSessionRequest } from "@/types/training";

export const DEFAULT_ANALYSIS_BARS = 200;
export const DEFAULT_TRAINING_BARS = 100;
export const DEFAULT_CHART_COUNT = 4;

export function buildRandomTrainingSessionRequest(
  accountId: number,
): CreateSessionRequest {
  return {
    accountId,
    mode: "RANDOM",
    analysisBars: DEFAULT_ANALYSIS_BARS,
    trainingBars: DEFAULT_TRAINING_BARS,
    chartCount: DEFAULT_CHART_COUNT,
  };
}

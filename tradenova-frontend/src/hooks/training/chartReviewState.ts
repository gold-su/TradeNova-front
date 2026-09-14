import type { TrainingEventResponse } from "@/types/training";
export type ChartReviewState = Record<
  string,
  {
    request: number;
    event: TrainingEventResponse | null;
    loading: boolean;
    error: string | null;
  }
>;
export type ChartReviewAction = { key: string; request: number } & (
  | { type: "start" }
  | {
      type: "finish";
      event: TrainingEventResponse | null;
      error: string | null;
    }
);
export function chartReviewReducer(
  state: ChartReviewState,
  action: ChartReviewAction,
): ChartReviewState {
  if (action.type === "start")
    return {
      ...state,
      [action.key]: {
        request: action.request,
        event: null,
        loading: true,
        error: null,
      },
    };
  if (state[action.key]?.request !== action.request) return state;
  return {
    ...state,
    [action.key]: {
      request: action.request,
      event: action.event,
      error: action.error,
      loading: false,
    },
  };
}
export function selectChartReview(
  state: ChartReviewState,
  sessionId: number | null,
  chartId: number | null,
) {
  const entry = state[`${sessionId}:${chartId}`];
  return {
    event: entry?.event?.chartId === chartId ? entry.event : null,
    loading: entry?.loading ?? false,
    error: entry?.error ?? null,
  };
}

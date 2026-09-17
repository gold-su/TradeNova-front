import { useCallback, useEffect, useReducer, useRef } from "react";
import axios from "axios";
import { reportApi } from "@/api/reportApi";
import type { ChartAiPayload, TrainingEventResponse } from "@/types/training";
import { chartReviewReducer, selectChartReview } from "./chartReviewState";

export function useChartAiReview(
  sessionId: number | null,
  chartId: number | null,
  appendEvent?: (event: TrainingEventResponse) => void,
) {
  const [state, dispatch] = useReducer(chartReviewReducer, {});
  const requestId = useRef(0);
  const request = useCallback(
    async (cid: number, analyze: boolean) => {
      const key = `${sessionId}:${cid}`;
      const id = ++requestId.current;
      dispatch({ type: "start", key, request: id });
      let event: TrainingEventResponse | null = null;
      let errorMessage: string | null = null;
      let generated = false;
      try {
        if (analyze) {
          try {
            event = await reportApi.analyzeChartAi(cid);
            generated = true;
          } catch (error) {
            if (
              !axios.isAxiosError(error) ||
              (error.response?.status !== 409 &&
                error.response?.data?.error !== "CHART_AI_ALREADY_EXISTS")
            )
              throw error;
            event = await reportApi.getLatestChartAi(cid);
          }
        } else event = await reportApi.getLatestChartAi(cid);
      } catch (error) {
        const missing =
          axios.isAxiosError(error) &&
          (error.response?.status === 404 ||
            error.response?.data?.error === "CHART_AI_NOT_FOUND");
        if (!missing)
          errorMessage = axios.isAxiosError<{ message?: string }>(error)
            ? (error.response?.data?.message ?? "차트 AI 요청에 실패했습니다.")
            : "차트 AI 요청에 실패했습니다.";
      }
      dispatch({
        type: "finish",
        key,
        request: id,
        event,
        error: errorMessage,
      });
      return { event, generated };
    },
    [sessionId],
  );
  useEffect(() => {
    if (chartId != null) void request(chartId, false);
  }, [chartId, request]);
  const review = selectChartReview(state, sessionId, chartId);
  return {
    chartAi: review.event,
    chartAiPayload: (review.event?.payloadJson ??
      null) as ChartAiPayload | null,
    chartAiLoading: review.loading,
    chartAiError: review.error,
    loadLatestChartAi: (targetChartId?: number | null) => {
      const cid = targetChartId ?? chartId;
      return cid == null
        ? Promise.resolve(null)
        : request(cid, false).then((result) => result.event);
    },
    onAnalyzeChartAi: async () => {
      if (chartId == null) return;
      const { event, generated } = await request(chartId, true);
      if (event && generated) appendEvent?.(event);
    },
  };
}

import { useChartAiReview } from "./useChartAiReview";
import { useEffect, useState } from "react";
import axios from "axios";
import { reportApi } from "@/api/reportApi";
import type {
  SessionAiPayload,
  TrainingEventResponse,
} from "@/types/training";

function apiError(error: unknown) {
  if (!axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    return { status: undefined, code: undefined, message: undefined };
  }
  return {
    status: error.response?.status,
    code: error.response?.data?.error,
    message: error.response?.data?.message,
  };
}

/**
 * 훈련 화면의 AI 관련 로직 훅
 *
 * 담당:
 * - 세션 AI latest 조회 / 분석
 * - 차트 AI latest 조회 / 분석
 * - 이미 결과가 있으면 409 대신 latest 다시 조회
 */
export function useTrainingAi(
  sessionId: number | null,
  chartId: number | null,
  appendEvent?: (event: TrainingEventResponse) => void,
) {
  // ===== 세션 AI 상태 =====
  const [sessionAi, setSessionAi] = useState<TrainingEventResponse | null>(
    null,
  );
  const [sessionAiLoading, setSessionAiLoading] = useState(false);
  const [sessionAiError, setSessionAiError] = useState<string | null>(null);

  const chartReview = useChartAiReview(sessionId, chartId, appendEvent);

  /**
   * 세션 AI 최신 결과 조회
   */
  const loadLatestSessionAi = async (targetSessionId?: number | null) => {
    const sid = targetSessionId ?? sessionId;

    if (!sid) {
      setSessionAi(null);
      return null;
    }

    try {
      setSessionAiLoading(true);
      setSessionAiError(null);

      const latest = await reportApi.getLatestSessionAi(sid);
      setSessionAi(latest);
      return latest;
    } catch (error: unknown) {
      const { status, code, message } = apiError(error);

      if (status === 404 || code === "SESSION_AI_NOT_FOUND") {
        setSessionAi(null);
        return null;
      }

      setSessionAiError(
        message ?? "세션 AI 결과 조회에 실패했습니다.",
      );
      return null;
    } finally {
      setSessionAiLoading(false);
    }
  };

  /**
   * 세션 AI 분석 실행
   * - 새로 생성되면 latest 재조회
   * - 이미 있으면 409 대신 latest 재조회
   */
  const onAnalyzeSessionAi = async () => {
    if (!sessionId) return;

    try {
      setSessionAiLoading(true);
      setSessionAiError(null);

      const event = await reportApi.analyzeSessionAi(sessionId);

      setSessionAi(event);
      appendEvent?.(event);
    } catch (error: unknown) {
      const { status, code, message } = apiError(error);

      if (status === 409 || code === "SESSION_AI_ALREADY_EXISTS") {
        await loadLatestSessionAi(sessionId);
        return;
      }

      setSessionAiError(
        message ?? "세션 AI 분석에 실패했습니다.",
      );
    } finally {
      setSessionAiLoading(false);
    }
  };

  /**
   * 세션이 바뀌면 세션 AI latest 자동 조회
   */
  useEffect(() => {
    if (!sessionId) {
      setSessionAi(null);
      return;
    }

    loadLatestSessionAi(sessionId);
  }, [sessionId]);

  const sessionAiPayload = (sessionAi?.payloadJson ??
    null) as SessionAiPayload | null;

  return {
    sessionAi,
    sessionAiPayload,
    sessionAiLoading,
    sessionAiError,
    loadLatestSessionAi,
    onAnalyzeSessionAi,

    ...chartReview,
  };
}

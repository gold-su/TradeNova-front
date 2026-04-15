import { useEffect, useState } from "react";
import { reportApi } from "@/api/reportApi";
import type {
  ChartAiPayload,
  SessionAiPayload,
  TrainingEventResponse,
} from "@/types/training";

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
) {
  // ===== 세션 AI 상태 =====
  const [sessionAi, setSessionAi] = useState<TrainingEventResponse | null>(
    null,
  );
  const [sessionAiLoading, setSessionAiLoading] = useState(false);
  const [sessionAiError, setSessionAiError] = useState<string | null>(null);

  // ===== 차트 AI 상태 =====
  const [chartAi, setChartAi] = useState<TrainingEventResponse | null>(null);
  const [chartAiLoading, setChartAiLoading] = useState(false);
  const [chartAiError, setChartAiError] = useState<string | null>(null);

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
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.error;

      if (status === 404 || code === "SESSION_AI_NOT_FOUND") {
        setSessionAi(null);
        return null;
      }

      setSessionAiError(
        e?.response?.data?.message ?? "세션 AI 결과 조회에 실패했습니다.",
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

      await reportApi.analyzeSessionAi(sessionId);
      await loadLatestSessionAi(sessionId);
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.error;

      if (status === 409 || code === "SESSION_AI_ALREADY_EXISTS") {
        await loadLatestSessionAi(sessionId);
        return;
      }

      setSessionAiError(
        e?.response?.data?.message ?? "세션 AI 분석에 실패했습니다.",
      );
    } finally {
      setSessionAiLoading(false);
    }
  };

  /**
   * 차트 AI 최신 결과 조회
   */
  const loadLatestChartAi = async (targetChartId?: number | null) => {
    
    console.log("analyze chartId =", chartId);

    const cid = targetChartId ?? chartId;

    if (!cid) {
      setChartAi(null);
      return null;
    }

    try {
      setChartAiLoading(true);
      setChartAiError(null);

      const latest = await reportApi.getLatestChartAi(cid);
      setChartAi(latest);
      return latest;
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.error;

      if (status === 404 || code === "CHART_AI_NOT_FOUND") {
        setChartAi(null);
        return null;
      }

      setChartAiError(
        e?.response?.data?.message ?? "차트 AI 결과 조회에 실패했습니다.",
      );
      return null;
    } finally {
      setChartAiLoading(false);
    }
  };

  /**
   * 차트 AI 분석 실행
   * - 새로 생성되면 latest 재조회
   * - 이미 있으면 409 대신 latest 재조회
   */
  const onAnalyzeChartAi = async () => {

    console.log("analyze chartId =", chartId);

    if (!chartId) return;

    try {
      setChartAiLoading(true);
      setChartAiError(null);

      await reportApi.analyzeChartAi(chartId);
      await loadLatestChartAi(chartId);
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.error;

      if (status === 409 || code === "CHART_AI_ALREADY_EXISTS") {
        await loadLatestChartAi(chartId);
        return;
      }

      setChartAiError(
        e?.response?.data?.message ?? "차트 AI 분석에 실패했습니다.",
      );
    } finally {
      setChartAiLoading(false);
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

  /**
   * 활성 차트가 바뀌면 차트 AI latest 자동 조회
   */
  useEffect(() => {
    if (!chartId) {
      setChartAi(null);
      return;
    }

    loadLatestChartAi(chartId);
  }, [chartId]);

  const sessionAiPayload = (sessionAi?.payloadJson ??
    null) as SessionAiPayload | null;
  const chartAiPayload = (chartAi?.payloadJson ??
    null) as ChartAiPayload | null;

  return {
    sessionAi,
    sessionAiPayload,
    sessionAiLoading,
    sessionAiError,
    loadLatestSessionAi,
    onAnalyzeSessionAi,

    chartAi,
    chartAiPayload,
    chartAiLoading,
    chartAiError,
    loadLatestChartAi,
    onAnalyzeChartAi,
  };
}

import { useEffect, useMemo, useState } from "react";
import { useTrainingTradeMarkers } from "@/hooks/training/useTrainingTradeMarkers";
import type { SessionSummaryResponse, TradeResponse } from "@/types/training";
import { useTrainingReport } from "@/hooks/training/useTrainingReport";
import { useTrainingSessionCore } from "@/hooks/training/useTrainingSessionCore";
import { useTrainingTrade } from "@/hooks/training/useTrainingTrade";
import { emptyProgress } from "@/hooks/training/training.utils";
import { useTrainingAi } from "@/hooks/training/useTrainingAi";
import { trainingApi } from "@/api/trainingApi";
import type { RiskRuleResponse, RiskRuleUpsertRequest } from "@/types/training";

/**
 * 훈련 페이지 전체 조립 훅
 *
 * 이 훅은 직접 무거운 비즈니스 로직을 들고 있지 않고,
 * 아래 3개의 하위 훅을 조립하는 역할을 맡는다.
 *
 * - useTrainingSessionCore: 세션/차트/캔들/진행도
 * - useTrainingReport: draft/snapshot/event/quick phrase
 * - useTrainingTrade: 거래 모달/BUY/SELL/SELL ALL
 */
export function useTrainingSessionPage() {
  // ===== 세션 핵심 로직 =====
  const core = useTrainingSessionCore();

  // ===== 리포트 로직 =====
  const report = useTrainingReport(core.activeChartId);

  // ===== AI 로직 =====
  const ai = useTrainingAi(
    core.sessionId,
    core.activeChartId,
    report.appendEvent,
  );

  const [riskRule, setRiskRule] = useState<RiskRuleResponse | null>(null);

  const [riskSaving, setRiskSaving] = useState(false);

  // ===== 세션 완료 화면 =====
  const [sessionSummary, setSessionSummary] =
    useState<SessionSummaryResponse | null>(null);

  const [showCompletion, setShowCompletion] = useState(false);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // ===== marker =====
  const { tradeMarkersByChart, loadTradeMarkers, addTradeMarker } =
    useTrainingTradeMarkers();

  /**
   * 거래 응답을 progress map에 반영하는 함수
   * trade는 progress 응답이 아니라 cash/qty/avg 정보를 주기 때문에
   * 기존 progress 상태에 합쳐서 반영한다.
   */
  const applyTrade = (res: TradeResponse) => {
    core.setProgressByChart((prev) => {
      const chartStatus =
        core.charts.find(
          (chart) => chart.chartId === res.chartId,
        )?.status ?? "IN_PROGRESS";

      const cur =
        prev[res.chartId] ??
        emptyProgress(
          res.chartId,
          chartStatus,
          core.status,
          Number(res.executedPrice),
        );

      return {
        ...prev,
        [res.chartId]: {
          ...cur,
          cashBalance: res.cashBalance,
          positionQty: res.positionQty,
          avgPrice: res.avgPrice,
          currentPrice: Number(res.executedPrice),
        },
      };
    });
  };

  // ===== 거래 로직 =====
  const trade = useTrainingTrade({
    activeChartId: core.activeChartId,
    status: core.status,
    loadEvents: report.loadEvents,
    setSnapshots: report.setSnapshots,
    setError: (message) => {
      report.setError(message);
      core.setError(message);
    },
    applyTrade,
    onTradeExecuted: addTradeMarker,
    currentPositionQty: core.activeProgress?.positionQty,
    appendEvent: report.appendEvent,
  });

  /**
   * 화면에서 버튼 비활성화 여부
   * - active chart가 없거나
   * - 세션이 이미 완료됐거나
   * - 로딩 중이면 비활성화
   */
  const disabled = useMemo(
    () =>
      !core.activeChartId ||
      core.status === "COMPLETED" ||
      core.loading ||
      trade.loading,
    [core.activeChartId, core.status, core.loading, trade.loading],
  );

  /**
   * 에러는 core / report 중 먼저 있는 것을 보여준다.
   */
  const error = core.error ?? report.error;

  /**
   * 세션 차트 로드 후 자동 복원
   */
  useEffect(() => {
    const chartIds = core.charts.map((chart) => chart.chartId);
    loadTradeMarkers(chartIds);
  }, [core.charts, loadTradeMarkers]);

  useEffect(() => {
    if (!core.activeChartId) {
      setRiskRule(null);
      return;
    }

    trainingApi
      .getRiskRule(core.activeChartId)
      .then(setRiskRule)
      .catch(() => setRiskRule(null));
  }, [core.activeChartId]);

  const saveRiskRule = async (body: RiskRuleUpsertRequest) => {
    if (!core.activeChartId) return;

    setRiskSaving(true);

    try {
      const saved = await trainingApi.upsertRiskRule(core.activeChartId, body);

      setRiskRule(saved);
    } finally {
      setRiskSaving(false);
    }
  };

  /**
   * 세션 완료 화면용 Summary 조회
   */
  const loadSessionSummary = async (targetSessionId?: number | null) => {
    const sid = targetSessionId ?? core.sessionId;

    if (!sid) return null;

    try {
      setSummaryLoading(true);
      setSummaryError(null);

      const summary = await trainingApi.getSessionSummary(sid);

      setSessionSummary(summary);
      setShowCompletion(true);

      return summary;
    } catch (e: any) {
      setSummaryError(
        e?.response?.data?.message ?? "세션 완료 정보를 불러오지 못했습니다.",
      );

      return null;
    } finally {
      setSummaryLoading(false);
    }
  };

  /**
   * 세션 종료
   * 1. 백엔드 세션 종료
   * 2. Summary 조회
   * 3. 완료 화면으로 전환
   */
  const onFinishSession = async () => {
    const sid = core.sessionId;

    if (!sid) return;

    const finished = await core.onFinishSession();

    // 종료 요청에 실패했다면 Summary 화면으로 넘어가지 않는다.
    if (!finished) return;

    await loadSessionSummary(sid);
  };

  const onCreateSession = async () => {
    setSessionSummary(null);
    setSummaryError(null);

    await core.onCreateSession();
  };

  /**
   * 완료 화면에서 새 훈련 시작
   *
   * 기존 Summary를 제거한 다음
   * 현재 선택 계좌로 새 세션을 생성한다.
   */
  const onStartNewSession = async () => {
    setShowCompletion(false);
    setSessionSummary(null);
    setSummaryError(null);

    await core.onCreateSession();
  };

  /**
   * 세션 AI 생성 후 완료 화면 Summary도 다시 조회한다.
   */
  const onAnalyzeSessionAi = async () => {
    await ai.onAnalyzeSessionAi();

    if (core.sessionId) {
      await loadSessionSummary(core.sessionId);
    }
  };



  return {
    // ===== 화면 모드 =====
    viewMode: core.viewMode,
    setViewMode: core.setViewMode,
    syncNext: core.syncNext,
    setSyncNext: core.setSyncNext,

    // ===== 세션 / 차트 =====
    sessionId: core.sessionId,
    status: core.status,
    accounts: core.accounts,
    accountId: core.accountId,
    setAccountId: core.setAccountId,

    charts: core.charts,
    activeChartId: core.activeChartId,
    setActiveChartId: core.setActiveChartId,

    activeSessionLoading: core.activeSessionLoading,
    loadActiveSession: core.loadActiveSession,

    loadAccounts: core.loadAccounts,

    // ===== 차트 데이터 =====
    candlesByChart: core.candlesByChart,
    progressByChart: core.progressByChart,
    activeChart: core.activeChart,
    activeCandles: core.activeCandles,
    activeProgress: core.activeProgress,
    visibleActiveCandles: core.visibleActiveCandles,

    // ===== 리포트 데이터 =====
    quickPhrases: report.quickPhrases,
    events: report.events,
    snapshots: report.snapshots,
    draft: report.draft,
    setDraft: report.setDraft,
    onCreateScenarioSnapshot: report.onCreateScenarioSnapshot,

    // ===== 로딩 / 에러 =====
    loading: core.loading || trade.loading,
    draftSaving: report.draftSaving,
    eventLoading: report.eventLoading,
    error,
    disabled,

    // ===== 거래 모달 =====
    tradeModalOpen: trade.tradeModalOpen,
    setTradeModalOpen: trade.setTradeModalOpen,
    tradeType: trade.tradeType,
    tradeForm: trade.tradeForm,
    setTradeForm: trade.setTradeForm,
    executeBuy: trade.executeBuy,
    executeSell: trade.executeSell,

    // ===== 액션 =====
    onCreateSession,
    onNext: () => core.onNext(core.advanceSteps, report.loadEvents),
    advanceSteps: core.advanceSteps,
    setAdvanceSteps: core.setAdvanceSteps,
    onSellAll: trade.onSellAll,
    onSaveDraft: report.onSaveDraft,
    onCreateSnapshot: report.onCreateSnapshot,
    onCreateNoteEvent: report.onCreateNoteEvent,
    appendQuickPhrase: report.appendQuickPhrase,
    handleConfirmTrade: trade.handleConfirmTrade,
    openBuyModal: trade.openBuyModal,
    openSellModal: trade.openSellModal,

    onFinishSession,

    // ===== AI =====
    sessionAi: ai.sessionAi,
    sessionAiPayload: ai.sessionAiPayload,
    sessionAiLoading: ai.sessionAiLoading,
    sessionAiError: ai.sessionAiError,
    loadLatestSessionAi: ai.loadLatestSessionAi,
    onAnalyzeSessionAi,

    chartAi: ai.chartAi,
    chartAiPayload: ai.chartAiPayload,
    chartAiLoading: ai.chartAiLoading,
    chartAiError: ai.chartAiError,
    loadLatestChartAi: ai.loadLatestChartAi,
    onAnalyzeChartAi: ai.onAnalyzeChartAi,

    // chart Refresh
    onRefreshChart: core.onRefreshChart,
    refreshRequest: core.refreshRequest,
    setRefreshRequest: core.setRefreshRequest,

    // 지표
    globalIndicators: core.globalIndicators,
    setGlobalIndicators: core.setGlobalIndicators,
    chartIndicators: core.chartIndicators,
    setChartIndicators: core.setChartIndicators,
    getIndicatorSettings: core.getIndicatorSettings,

    lastSavedMessage: trade.lastSavedMessage,

    riskRule,
    riskSaving,
    saveRiskRule,

    tradeMarkersByChart,
    currentPositionQty: core.activeProgress?.positionQty,
    onTradeExecuted: (input) =>
      addTradeMarker({
        ...input,
        fallbackTime:
          core.visibleActiveCandles[core.visibleActiveCandles.length - 1]?.t,
      }),

    // ===== 세션 완료 화면 =====
    showCompletion,
    sessionSummary,
    summaryLoading,
    summaryError,
    loadSessionSummary,
    onStartNewSession,
  };
}

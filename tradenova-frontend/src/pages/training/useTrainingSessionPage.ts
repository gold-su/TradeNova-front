import { useEffect, useMemo } from "react";
import { useTrainingTradeMarkers } from "@/hooks/training/useTrainingTradeMarkers";
import type { TradeResponse } from "@/types/training";
import { useTrainingReport } from "@/hooks/training/useTrainingReport";
import { useTrainingSessionCore } from "@/hooks/training/useTrainingSessionCore";
import { useTrainingTrade } from "@/hooks/training/useTrainingTrade";
import { emptyProgress } from "@/hooks/training/training.utils";
import { useTrainingAi } from "@/hooks/training/useTrainingAi";
import type { TradeChartMarker } from "@/components/training/chart/CandleChart";
import { paperAccountApi } from "@/api/paperAccountApi";

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
  const ai = useTrainingAi(core.sessionId, core.activeChartId);

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
      const cur =
        prev[res.chartId] ??
        emptyProgress(res.chartId, core.status, Number(res.executedPrice));

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
    onCreateSession: core.onCreateSession,
    onNext: () => core.onNext(report.loadEvents),
    onSellAll: trade.onSellAll,
    onSaveDraft: report.onSaveDraft,
    onCreateSnapshot: report.onCreateSnapshot,
    onCreateNoteEvent: report.onCreateNoteEvent,
    appendQuickPhrase: report.appendQuickPhrase,
    handleConfirmTrade: trade.handleConfirmTrade,
    openBuyModal: trade.openBuyModal,
    openSellModal: trade.openSellModal,

    onFinishSession: core.onFinishSession,

    // ===== AI =====
    sessionAi: ai.sessionAi,
    sessionAiPayload: ai.sessionAiPayload,
    sessionAiLoading: ai.sessionAiLoading,
    sessionAiError: ai.sessionAiError,
    loadLatestSessionAi: ai.loadLatestSessionAi,
    onAnalyzeSessionAi: ai.onAnalyzeSessionAi,

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

    tradeMarkersByChart,
    currentPositionQty: core.activeProgress?.positionQty,
    onTradeExecuted: (input) =>
      addTradeMarker({
        ...input,
        fallbackTime:
          core.visibleActiveCandles[core.visibleActiveCandles.length - 1]?.t,
      }),
  };
}

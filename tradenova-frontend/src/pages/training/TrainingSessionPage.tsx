import { TrainingCenterPanel } from "@/components/training/layout/TrainingCenterPanel";
import { TrainingLeftPanel } from "@/components/training/layout/TrainingLeftPanel";
import { TrainingRightPanel } from "@/components/training/layout/TrainingRightPanel";
import { useTrainingSessionPage } from "@/pages/training/useTrainingSessionPage";

export default function TrainingSessionPage() {
  const page = useTrainingSessionPage();
  if (page.activeSessionLoading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/60 bg-background/40 px-8 py-6 text-center shadow-sm">
          <div className="mb-2 text-sm font-semibold">훈련 세션 복구 중</div>
          <div className="text-xs text-muted-foreground">
            이전 훈련 기록과 차트 상태를 불러오고 있습니다.
          </div>
        </div>
      </div>
    );
  }
  if (!page.sessionId) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full bg-background">
        <TrainingLeftPanel
          sessionId={page.sessionId}
          status={page.status}
          accounts={page.accounts}
          accountId={page.accountId}
          setAccountId={page.setAccountId}
          loadAccounts={page.loadAccounts}
          viewMode={page.viewMode}
          setViewMode={page.setViewMode}
          syncNext={page.syncNext}
          setSyncNext={page.setSyncNext}
          charts={page.charts}
          activeChartId={page.activeChartId}
          setActiveChartId={page.setActiveChartId}
          loading={page.loading}
          onCreateSession={page.onCreateSession}
          onFinishSession={page.onFinishSession}
          onAnalyzeSessionAi={page.onAnalyzeSessionAi}
          sessionAiLoading={page.sessionAiLoading}
          sessionAiExists={!!page.sessionAi}
        />

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-border/60 bg-background/40 p-8 text-center shadow-sm">
            <div className="mb-3 text-xl font-semibold">
              진행 중인 훈련 세션이 없습니다
            </div>
            <div className="mb-6 text-sm leading-6 text-muted-foreground">
              새 훈련을 시작하면 랜덤 차트 기반으로 매수/매도 판단, 보조지표
              설정, 매매 기록, AI 분석을 진행할 수 있습니다.
            </div>

            <button
              type="button"
              onClick={page.onCreateSession}
              disabled={page.loading}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {page.loading ? "훈련 생성 중..." : "새 훈련 시작"}
            </button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden">
      <TrainingLeftPanel
        sessionId={page.sessionId}
        status={page.status}
        accounts={page.accounts}
        accountId={page.accountId}
        setAccountId={page.setAccountId}
        loadAccounts={page.loadAccounts}
        viewMode={page.viewMode}
        setViewMode={page.setViewMode}
        syncNext={page.syncNext}
        setSyncNext={page.setSyncNext}
        charts={page.charts}
        activeChartId={page.activeChartId}
        setActiveChartId={page.setActiveChartId}
        loading={page.loading}
        onCreateSession={page.onCreateSession}
        onFinishSession={page.onFinishSession}
        onAnalyzeSessionAi={page.onAnalyzeSessionAi}
        sessionAiLoading={page.sessionAiLoading}
        sessionAiExists={!!page.sessionAi}
        progressByChart={page.progressByChart}
        onCreateScenarioSnapshot={page.onCreateScenarioSnapshot}
      />

      <TrainingCenterPanel
        charts={page.charts}
        activeChartId={page.activeChartId}
        setActiveChartId={page.setActiveChartId}
        viewMode={page.viewMode}
        setViewMode={page.setViewMode}
        candlesByChart={page.candlesByChart}
        progressByChart={page.progressByChart}
        activeChart={page.activeChart}
        activeProgress={page.activeProgress}
        visibleActiveCandles={page.visibleActiveCandles}
        error={page.error}
        onRefreshChart={page.onRefreshChart}
        refreshing={page.loading}
        refreshRequest={page.refreshRequest}
        setRefreshRequest={page.setRefreshRequest}
        globalIndicators={page.globalIndicators}
        setGlobalIndicators={page.setGlobalIndicators}
        chartIndicators={page.chartIndicators}
        setChartIndicators={page.setChartIndicators}
        getIndicatorSettings={page.getIndicatorSettings}
        tradeMarkersByChart={page.tradeMarkersByChart ?? {}}
      />

      <TrainingRightPanel
        activeChart={page.activeChart}
        activeProgress={page.activeProgress}
        quickPhrases={page.quickPhrases}
        events={page.events}
        snapshots={page.snapshots}
        draft={page.draft}
        setDraft={page.setDraft}
        loading={page.loading}
        draftSaving={page.draftSaving}
        eventLoading={page.eventLoading}
        disabled={page.disabled}
        onNext={page.onNext}
        advanceSteps={page.advanceSteps}
        setAdvanceSteps={page.setAdvanceSteps}
        onSellAll={page.onSellAll}
        onSaveDraft={page.onSaveDraft}
        onCreateSnapshot={page.onCreateSnapshot}
        onCreateNoteEvent={page.onCreateNoteEvent}
        appendQuickPhrase={page.appendQuickPhrase}
        openBuyModal={page.openBuyModal}
        openSellModal={page.openSellModal}
        sessionAiPayload={page.sessionAiPayload}
        sessionAiLoading={page.sessionAiLoading}
        chartAiPayload={page.chartAiPayload}
        chartAiLoading={page.chartAiLoading}
        onAnalyzeChartAi={page.onAnalyzeChartAi}
        onAnalyzeSessionAi={page.onAnalyzeSessionAi}
        syncNext={page.syncNext}
        setSyncNext={page.setSyncNext}
        tradeForm={page.tradeForm}
        setTradeForm={page.setTradeForm}
        executeBuy={page.executeBuy}
        executeSell={page.executeSell}
        lastSavedMessage={page.lastSavedMessage}
      />
    </div>
  );
}

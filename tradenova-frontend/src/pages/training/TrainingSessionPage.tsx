import { TrainingCenterPanel } from "@/components/training/layout/TrainingCenterPanel";
import { TrainingLeftPanel } from "@/components/training/layout/TrainingLeftPanel";
import { TrainingRightPanel } from "@/components/training/layout/TrainingRightPanel";
import { useTrainingSessionPage } from "@/pages/training/useTrainingSessionPage";
import { TrainingCompletionPage } from "@/components/training/completion/TrainingCompletionPage";
import { useI18n } from "@/i18n/LanguageProvider";

export default function TrainingSessionPage() {
  const { t } = useI18n();
  const page = useTrainingSessionPage();
  if (page.activeSessionLoading) {
    return (
      <div className="flex h-[calc(100dvh-57px)] w-full items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/60 bg-background/40 px-8 py-6 text-center shadow-sm">
          <div className="mb-2 text-sm font-semibold">{t("training.session.restoring")}</div>
          <div className="text-xs text-muted-foreground">
            {t("training.session.restoringBody")}
          </div>
        </div>
      </div>
    );
  }

  // 세션 종료 후 기존 좌/중/우 패널 대신 완료 화면 표시
  if (page.showCompletion) {
    return (
      <TrainingCompletionPage
        summary={page.sessionSummary}
        summaryLoading={page.summaryLoading}
        summaryError={page.summaryError}
        sessionAiPayload={page.sessionAiPayload}
        sessionAiLoading={page.sessionAiLoading}
        sessionAiError={page.sessionAiError}
        newSessionLoading={page.newSessionLoading}
        onReloadSummary={() => page.loadSessionSummary(page.sessionId)}
        onAnalyzeSessionAi={page.onAnalyzeSessionAi}
        onLoadSessionAi={() => page.loadLatestSessionAi(page.sessionId)}
        onStartNewSession={page.onStartNewSession}
      />
    );
  }

  if (!page.sessionId) {
    return (
      <div className="flex h-[calc(100dvh-57px)] w-full bg-background">
        <TrainingLeftPanel
          sessionId={page.sessionId}
          status={page.status}
          accounts={page.accounts}
          accountId={page.accountId}
          setAccountId={page.setAccountId}
          loadAccounts={page.loadAccounts}
          charts={page.charts}
          activeChartId={page.activeChartId}
          setActiveChartId={page.setActiveChartId}
          loading={page.loading}
          onCreateSession={page.onCreateSession}
          onFinishSession={page.onFinishSession}
          progressByChart={page.progressByChart}
          chartAiPayload={page.chartAiPayload}
          chartAiLoading={page.chartAiLoading}
          onAnalyzeChartAi={page.onAnalyzeChartAi}
        />

        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-3xl border border-border/60 bg-background/40 p-8 text-center shadow-sm">
            <div className="mb-3 text-xl font-semibold">
              {t("training.session.empty")}
            </div>
            <div className="mb-6 text-sm leading-6 text-muted-foreground">
              {t("training.session.emptyBody")}
            </div>

            <button
              type="button"
              onClick={page.onCreateSession}
              disabled={page.loading}
              className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {page.loading ? t("training.session.creating") : t("training.session.start")}
            </button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="flex h-[calc(100dvh-57px)] w-full overflow-hidden">
      <TrainingLeftPanel
        sessionId={page.sessionId}
        status={page.status}
        accounts={page.accounts}
        accountId={page.accountId}
        setAccountId={page.setAccountId}
        loadAccounts={page.loadAccounts}
        charts={page.charts}
        activeChartId={page.activeChartId}
        setActiveChartId={page.setActiveChartId}
        loading={page.loading}
        onCreateSession={page.onCreateSession}
        onFinishSession={page.onFinishSession}
        progressByChart={page.progressByChart}
        chartAiPayload={page.chartAiPayload}
        chartAiLoading={page.chartAiLoading}
        onAnalyzeChartAi={page.onAnalyzeChartAi}
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
        autoExitNotices={page.autoExitNotices}
        onRefreshChart={page.onRefreshChart}
        refreshingChartIds={page.refreshingChartIds}
        refreshRequest={page.refreshRequest}
        setRefreshRequest={page.setRefreshRequest}
        globalIndicators={page.globalIndicators}
        setGlobalIndicators={page.setGlobalIndicators}
        chartIndicators={page.chartIndicators}
        setChartIndicators={page.setChartIndicators}
        getIndicatorSettings={page.getIndicatorSettings}
        tradeMarkersByChart={page.tradeMarkersByChart ?? {}}
        drawingsByChart={page.drawingsByChart}
        drawingTool={page.drawingTool}
        onSelectDrawingTool={page.selectDrawingTool}
        pendingDrawing={page.pendingDrawing}
        selectedDrawing={page.selectedDrawing}
        onAddDrawingPoint={page.addDrawingPoint}
        onCommitDrawingText={page.commitDrawingText}
        onCancelDrawingDraft={page.cancelDrawingDraft}
        onSelectDrawing={page.setSelectedDrawing}
        onDeleteSelectedDrawing={page.deleteSelectedDrawing}
        onClearChartDrawings={page.clearChartDrawings}
      />

      <TrainingRightPanel
        charts={page.charts}
        activeChart={page.activeChart}
        onSelectChart={page.setActiveChartId}
        activeProgress={page.activeProgress}
        quickPhrases={page.quickPhrases}
        createQuickPhrase={page.createQuickPhrase}
        updateQuickPhrase={page.updateQuickPhrase}
        deleteQuickPhrase={page.deleteQuickPhrase}
        events={page.events}
        snapshots={page.snapshots}
        loading={page.loading}
        eventLoading={page.eventLoading}
        disabled={page.disabled}
        onNext={page.onNext}
        advanceSteps={page.advanceSteps}
        setAdvanceSteps={page.setAdvanceSteps}
        onSellAll={page.onSellAll}
        onCreateScenarioSnapshot={page.onCreateScenarioSnapshot}
        syncNext={page.syncNext}
        setSyncNext={page.setSyncNext}
        tradeForm={page.tradeForm}
        setTradeForm={page.setTradeForm}
        executeBuy={page.executeBuy}
        executeSell={page.executeSell}
        executeWait={page.executeWait}
        lastSavedMessage={page.lastSavedMessage}
        riskRule={page.riskRule}
        riskSaving={page.riskSaving}
        saveRiskRule={page.saveRiskRule}
      />
    </div>
  );
}

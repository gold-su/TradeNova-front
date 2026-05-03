import { TrainingCenterPanel } from "@/components/training/layout/TrainingCenterPanel";
import { TrainingLeftPanel } from "@/components/training/layout/TrainingLeftPanel";
import { TrainingRightPanel } from "@/components/training/layout/TrainingRightPanel";
import { TradeReasonModal } from "@/components/training/modal/TradeReasonModal";
import { useTrainingSessionPage } from "@/pages/training/useTrainingSessionPage";

export default function TrainingSessionPage() {
  const page = useTrainingSessionPage();

  return (
    <div className="flex h-[calc(100vh-56px)] w-full overflow-hidden">
      <TrainingLeftPanel
        sessionId={page.sessionId}
        status={page.status}
        accounts={page.accounts}
        accountId={page.accountId}
        setAccountId={page.setAccountId}
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
        onSellAll={page.onSellAll}
        onSaveDraft={page.onSaveDraft}
        onCreateSnapshot={page.onCreateSnapshot}
        onCreateNoteEvent={page.onCreateNoteEvent}
        appendQuickPhrase={page.appendQuickPhrase}
        openBuyModal={page.openBuyModal}
        openSellModal={page.openSellModal}
        sessionAiPayload={page.sessionAiPayload}
        sessionAiLoading={page.sessionAiLoading}
        sessionAiPayload={page.sessionAiPayload}
        sessionAiLoading={page.sessionAiLoading}
        chartAiPayload={page.chartAiPayload}
        chartAiLoading={page.chartAiLoading}
        onAnalyzeChartAi={page.onAnalyzeChartAi}
      />

      <TradeReasonModal
        open={page.tradeModalOpen}
        tradeType={page.tradeType}
        tradeForm={page.tradeForm}
        setTradeForm={page.setTradeForm}
        loading={page.loading}
        onClose={() => page.setTradeModalOpen(false)}
        onConfirm={page.handleConfirmTrade}
      />
    </div>
  );
}

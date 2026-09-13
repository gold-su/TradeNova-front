import type {
  ChartAiPayload,
  ProgressResponse,
  QuickPhraseResponse,
  ReportDocumentResponse,
  ReportDraftContent,
  TrainingChartDto,
  TrainingEventResponse,
  RiskRuleResponse,
  RiskRuleUpsertRequest,
} from "@/types/training";
import { AccountSnapshotCard } from "@/components/training/common/AccountSnapshotCard";
import { SnapshotListPanel } from "@/components/training/report/SnapshotListPanel";
import { TrainingTradeJournalPanel } from "@/components/training/common/TrainingTradeJournalPanel";
import { EventLogPanel } from "@/components/training/report/EventLogPanel";
import { AiReviewPanel } from "@/components/training/ai/AiReviewPanel";
import type { TradeForm } from "@/hooks/training/training.types";
import { findLatestScenarioSnapshot } from "@/hooks/training/trainingTradeReason";

type Props = {
  activeChart: TrainingChartDto | null;
  activeProgress: ProgressResponse | null;
  quickPhrases: QuickPhraseResponse[];
  events: TrainingEventResponse[];
  snapshots: ReportDocumentResponse[];
  draft: ReportDraftContent;
  setDraft: React.Dispatch<React.SetStateAction<ReportDraftContent>>;
  loading: boolean;
  draftSaving: boolean;
  eventLoading: boolean;
  disabled: boolean;
  onNext: () => void;
  onSellAll: () => void;
  onSaveDraft: () => void;
  onCreateSnapshot: () => void;
  onCreateNoteEvent: () => void;
  appendQuickPhrase: (content: string) => void;
  openBuyModal: () => void;
  openSellModal: () => void;
  chartAiPayload: ChartAiPayload | null;
  chartAiLoading: boolean;
  onAnalyzeChartAi: () => void;
  syncNext: boolean;
  setSyncNext: React.Dispatch<React.SetStateAction<boolean>>;
  tradeForm: TradeForm;
  setTradeForm: React.Dispatch<React.SetStateAction<TradeForm>>;
  executeBuy: () => void;
  executeSell: () => void;
  lastSavedMessage: {
    text: string;
    side: "BUY" | "SELL";
  } | null;
  advanceSteps: number;
  setAdvanceSteps: React.Dispatch<React.SetStateAction<number>>;
  riskRule: RiskRuleResponse | null;
  riskSaving: boolean;
  saveRiskRule: (body: RiskRuleUpsertRequest) => void;
};

export function TrainingRightPanel({
  activeChart,
  activeProgress,
  quickPhrases,
  events,
  snapshots,
  loading,
  eventLoading,
  disabled,
  onNext,
  onSellAll,
  chartAiPayload,
  chartAiLoading,
  onAnalyzeChartAi,
  syncNext,
  setSyncNext,
  tradeForm,
  setTradeForm,
  executeBuy,
  executeSell,
  lastSavedMessage,
  advanceSteps,
  setAdvanceSteps,
  riskRule,
  riskSaving,
  saveRiskRule,
}: Props) {
  const latestScenarioSnapshot = findLatestScenarioSnapshot(
    snapshots,
    activeChart?.chartId ?? null,
  );

  return (
    <aside className="w-[420px] shrink-0 border-l border-border/60 bg-background/40 p-4">
      <div className="thin-scrollbar h-full space-y-4 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        <AiReviewPanel
          activeChartLabel={
            activeChart
              ? `Chart ${activeChart.chartIndex + 1}`
              : "차트 선택 안 됨"
          }
          chartAiPayload={chartAiPayload}
          chartAiLoading={chartAiLoading}
          onAnalyzeChartAi={onAnalyzeChartAi}
          disabled={loading || !activeChart}
        />

        <TrainingTradeJournalPanel
          key={activeChart?.chartId ?? "no-chart"}
          tradeForm={tradeForm}
          setTradeForm={setTradeForm}
          quickPhrases={quickPhrases}
          disabled={disabled}
          loading={loading}
          syncNext={syncNext}
          setSyncNext={setSyncNext}
          lastSavedMessage={lastSavedMessage}
          onBuy={executeBuy}
          onSell={executeSell}
          onSellAll={onSellAll}
          onNext={onNext}
          advanceSteps={advanceSteps}
          setAdvanceSteps={setAdvanceSteps}
          riskRule={riskRule}
          riskSaving={riskSaving}
          saveRiskRule={saveRiskRule}
          cashBalance={activeProgress?.cashBalance ?? 0}
          positionQty={activeProgress?.positionQty ?? 0}
          currentPrice={activeProgress?.currentPrice ?? 0}
          latestScenarioSnapshot={latestScenarioSnapshot}
        />

        <EventLogPanel items={events} loading={eventLoading} />

        <SnapshotListPanel items={snapshots} />
      </div>
    </aside>
  );
}

import type {
  ProgressResponse,
  QuickPhraseResponse,
  ReportDocumentResponse,
  TrainingChartDto,
  TrainingEventResponse,
  RiskRuleResponse,
  RiskRuleUpsertRequest,
} from "@/types/training";
import { AccountSnapshotCard } from "@/components/training/common/AccountSnapshotCard";
import { TrainingTradeJournalPanel } from "@/components/training/common/TrainingTradeJournalPanel";
import { EventLogPanel } from "@/components/training/report/EventLogPanel";
import type { TradeForm } from "@/hooks/training/training.types";
import { findLatestScenarioSnapshot } from "@/hooks/training/trainingTradeReason";
import { TrainingPlanSection } from "@/components/training/common/TrainingPlanSection";

type Props = {
  activeChart: TrainingChartDto | null;
  activeProgress: ProgressResponse | null;
  quickPhrases: QuickPhraseResponse[];
  createQuickPhrase: (content: string) => Promise<QuickPhraseResponse>;
  updateQuickPhrase: (id: number, content: string) => Promise<QuickPhraseResponse>;
  deleteQuickPhrase: (id: number) => Promise<void>;
  events: TrainingEventResponse[];
  snapshots: ReportDocumentResponse[];
  loading: boolean;
  eventLoading: boolean;
  disabled: boolean;
  onNext: () => void;
  onSellAll: () => Promise<boolean>;
  onCreateScenarioSnapshot: (
    chartId: number,
    content: {
      thesis: string;
      entryReason: string;
      exitPlan: string;
      riskNote: string;
      freeNote: string;
    },
  ) => Promise<unknown>;
  syncNext: boolean;
  setSyncNext: React.Dispatch<React.SetStateAction<boolean>>;
  tradeForm: TradeForm;
  setTradeForm: React.Dispatch<React.SetStateAction<TradeForm>>;
  executeBuy: () => Promise<boolean>;
  executeSell: () => Promise<boolean>;
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
  createQuickPhrase,
  updateQuickPhrase,
  deleteQuickPhrase,
  events,
  snapshots,
  loading,
  eventLoading,
  disabled,
  onNext,
  onSellAll,
  onCreateScenarioSnapshot,
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
    <aside className="flex h-full min-h-0 w-[360px] shrink-0 flex-col border-l border-border/40 bg-background/40 px-4 py-4">
      <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        <TrainingPlanSection
          key={`plan-${activeChart?.chartId ?? "none"}`}
          snapshots={snapshots}
          events={events}
          activeChart={activeChart}
          latestScenario={latestScenarioSnapshot}
          onCreateScenario={onCreateScenarioSnapshot}
        />

        <div className="min-h-4 flex-1" aria-hidden="true" />

        <TrainingTradeJournalPanel
          key={`trade-${activeChart?.chartId ?? "none"}`}
          tradeForm={tradeForm}
          setTradeForm={setTradeForm}
          quickPhrases={quickPhrases}
          createQuickPhrase={createQuickPhrase}
          updateQuickPhrase={updateQuickPhrase}
          deleteQuickPhrase={deleteQuickPhrase}
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
          scenarioSnapshots={snapshots}
          chartId={activeChart?.chartId ?? null}
        />
      </div>
      <div className="mt-4 max-h-[220px] shrink-0 overflow-y-auto border-t border-border/35 pt-3">
        <EventLogPanel
          items={events.filter(
            (event) => event.chartId === activeChart?.chartId,
          )}
          loading={eventLoading}
        />
      </div>
    </aside>
  );
}

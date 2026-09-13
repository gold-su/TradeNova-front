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
import { SnapshotListPanel } from "@/components/training/report/SnapshotListPanel";
import { TrainingTradeJournalPanel } from "@/components/training/common/TrainingTradeJournalPanel";
import { EventLogPanel } from "@/components/training/report/EventLogPanel";
import type { TradeForm } from "@/hooks/training/training.types";
import { findLatestScenarioSnapshot } from "@/hooks/training/trainingTradeReason";
import { TrainingPlanSection } from "@/components/training/common/TrainingPlanSection";

type Props = {
  activeChart: TrainingChartDto | null;
  activeProgress: ProgressResponse | null;
  quickPhrases: QuickPhraseResponse[];
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
    <aside className="w-[400px] shrink-0 border-l border-border/60 bg-background/40 p-4">
      <div className="thin-scrollbar h-full space-y-3 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        <TrainingPlanSection
          activeChart={activeChart}
          latestScenario={latestScenarioSnapshot}
          onCreateScenario={onCreateScenarioSnapshot}
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

import type {
  ChartAiPayload,
  ProgressResponse,
  QuickPhraseResponse,
  ReportDocumentResponse,
  ReportDraftContent,
  SessionAiPayload,
  TrainingChartDto,
  TrainingEventResponse,
} from "@/types/training";
import { AccountSnapshotCard } from "@/components/training/common/AccountSnapshotCard";
import { SnapshotListPanel } from "@/components/training/report/SnapshotListPanel";
import { TrainingTradeJournalPanel } from "@/components/training/common/TrainingTradeJournalPanel";
import { EventLogPanel } from "@/components/training/report/EventLogPanel";
import { AiReviewPanel } from "@/components/training/ai/AiReviewPanel";

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
  sessionAiPayload: SessionAiPayload | null;
  sessionAiLoading: boolean;
  chartAiPayload: ChartAiPayload | null;
  chartAiLoading: boolean;
  onAnalyzeChartAi: () => void;
  onAnalyzeSessionAi: () => void;
  syncNext: boolean;
  setSyncNext: React.Dispatch<React.SetStateAction<boolean>>;
  tradeForm: {
    qty: number;
    entryReason: string;
    riskNote: string;
  };
  setTradeForm: React.Dispatch<
    React.SetStateAction<{
      qty: number;
      entryReason: string;
      riskNote: string;
    }>
  >;
  executeBuy: () => void;
  executeSell: () => void;
  lastSavedMessage: {
    text: string;
    side: "BUY" | "SELL";
  } | null;
};

export function TrainingRightPanel({
  activeChart,
  activeProgress,
  quickPhrases,
  events,
  snapshots,
  draft,
  setDraft,
  loading,
  draftSaving,
  eventLoading,
  disabled,
  onNext,
  onSellAll,
  onSaveDraft,
  onCreateSnapshot,
  onCreateNoteEvent,
  appendQuickPhrase,
  openBuyModal,
  openSellModal,
  sessionAiPayload,
  sessionAiLoading,
  chartAiPayload,
  chartAiLoading,
  onAnalyzeChartAi,
  onAnalyzeSessionAi,
  syncNext,
  setSyncNext,
  tradeForm,
  setTradeForm,
  executeBuy,
  executeSell,
  lastSavedMessage,
}: Props) {
  return (
    <aside className="w-[420px] shrink-0 border-l border-border/60 bg-background/40 p-4">
      <div className="thin-scrollbar h-full space-y-4 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        <AiReviewPanel
          activeChartLabel={
            activeChart ? `Chart ${activeChart.chartIndex + 1}` : "차트 선택 안 됨"
          }
          sessionAiPayload={sessionAiPayload}
          sessionAiLoading={sessionAiLoading}
          chartAiPayload={chartAiPayload}
          chartAiLoading={chartAiLoading}
          onAnalyzeChartAi={onAnalyzeChartAi}
          onAnalyzeSessionAi={onAnalyzeSessionAi}
          disabled={loading || !activeChart}
        />

        <TrainingTradeJournalPanel
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
        />

        <EventLogPanel items={events} loading={eventLoading} />

        <SnapshotListPanel items={snapshots} />
      </div>
    </aside>
  );
}

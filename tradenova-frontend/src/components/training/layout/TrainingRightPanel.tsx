import type {
  ProgressResponse,
  QuickPhraseResponse,
  ReportDocumentResponse,
  ReportDraftContent,
  TrainingChartDto,
  TrainingEventResponse,
} from "@/types/training";
import { AccountSnapshotCard } from "@/components/training/common/AccountSnapshotCard";
import { TrainingActionBar } from "@/components/training/common/TrainingActionBar";
import { DraftEditor } from "@/components/training/report/DraftEditor";
import { EventLogPanel } from "@/components/training/report/EventLogPanel";
import { QuickPhrasePanel } from "@/components/training/report/QuickPhrasePanel";
import { SnapshotListPanel } from "@/components/training/report/SnapshotListPanel";

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
}: Props) {
  return (
    <aside className="w-[420px] shrink-0 border-l border-border/60 bg-background/40 p-4">
      <div className="h-full space-y-4 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        <TrainingActionBar
          disabled={disabled}
          loading={loading}
          onNext={onNext}
          onSellAll={onSellAll}
          onBuy={openBuyModal}
          onSell={openSellModal}
        />

        <QuickPhrasePanel items={quickPhrases} onAppend={appendQuickPhrase} />

        <DraftEditor
          value={draft}
          onChange={setDraft}
          onSave={onSaveDraft}
          onCreateSnapshot={onCreateSnapshot}
          onCreateNoteEvent={onCreateNoteEvent}
          saving={draftSaving}
        />

        <EventLogPanel items={events} loading={eventLoading} />

        <SnapshotListPanel items={snapshots} />
      </div>
    </aside>
  );
}

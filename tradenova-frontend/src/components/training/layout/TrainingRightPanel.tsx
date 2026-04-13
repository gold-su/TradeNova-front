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
import type { SessionAiPayload } from "@/types/training";
import type { ChartAiPayload, SessionAiPayload } from "@/types/training";

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
}: Props) {
  return (
    <aside className="w-[420px] shrink-0 border-l border-border/60 bg-background/40 p-4">
      <div className="h-full space-y-4 overflow-y-auto pr-1">
        <AccountSnapshotCard chart={activeChart} progress={activeProgress} />

        {sessionAiPayload && (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="mb-2 text-sm font-semibold">세션 AI 리뷰</div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">점수 </span>
                <span className="font-semibold">{sessionAiPayload.score}</span>
              </div>

              <p className="leading-6 text-foreground/90">
                {sessionAiPayload.summary}
              </p>

              <div className="text-xs text-muted-foreground">
                생성 시각: {sessionAiPayload.generatedAt}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>차트 수: {sessionAiPayload.totalChartCount}</div>
                <div>완료 차트: {sessionAiPayload.completedChartCount}</div>
                <div>거래 차트: {sessionAiPayload.tradedChartCount}</div>
                <div>
                  스냅샷 사용: {sessionAiPayload.hasSnapshots ? "예" : "아니오"}
                </div>
              </div>
            </div>
          </div>
        )}

        {chartAiPayload && (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold">차트 AI 리뷰</div>
              <button
                onClick={onAnalyzeChartAi}
                disabled={loading || chartAiLoading || !activeChart}
                className="rounded-xl border border-border/60 bg-background px-3 py-1 text-xs disabled:opacity-50"
              >
                {chartAiLoading ? "분석 중..." : "다시 보기"}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">점수 </span>
                <span className="font-semibold">{chartAiPayload.score}</span>
              </div>

              <p className="leading-6 text-foreground/90">
                {chartAiPayload.summary}
              </p>

              <div className="text-xs text-muted-foreground">
                생성 시각: {chartAiPayload.generatedAt}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>손절가: {chartAiPayload.stopLossPrice ?? "-"}</div>
                <div>익절가: {chartAiPayload.takeProfitPrice ?? "-"}</div>
                <div>
                  자동청산: {chartAiPayload.autoExitEnabled ? "예" : "아니오"}
                </div>
                <div>스냅샷 ID: {chartAiPayload.snapshotId ?? "-"}</div>
              </div>
            </div>
          </div>
        )}

        {!chartAiPayload && activeChart && (
          <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="mb-2 text-sm font-semibold">차트 AI 리뷰</div>
            <p className="mb-3 text-sm text-muted-foreground">
              아직 이 차트에 대한 AI 분석 결과가 없습니다.
            </p>
            <button
              onClick={onAnalyzeChartAi}
              disabled={loading || chartAiLoading}
              className="rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {chartAiLoading ? "차트 AI 분석 중..." : "차트 AI 분석"}
            </button>
          </div>
        )}

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

import { AccountSelectorCard } from "@/components/training/account/AccountSelectorCard";
import { AiReviewPanel } from "@/components/training/ai/AiReviewPanel";
import type { ProgressMap } from "@/hooks/training/training.types";
import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ChartAiPayload,
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";
import type { PaperAccountDto } from "@/hooks/training/training.types";
import { getTrainingProgressDisplay } from "@/hooks/training/trainingCandleReveal";

type Props = {
  sessionId: number | null;
  status: TrainingStatus;

  accounts: PaperAccountDto[];
  accountId: number | null;
  setAccountId: Dispatch<SetStateAction<number | null>>;

  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;

  loading: boolean;

  onFinishSession: () => Promise<boolean>;

  loadAccounts: (selectAccountId?: number) => Promise<void>;

  onCreateSession: () => void;
  progressByChart?: ProgressMap;
  reviewTargetChartId: number | null;
  setReviewTargetChartId: Dispatch<SetStateAction<number | null>>;
  chartAiPayload: ChartAiPayload | null;
  chartAiLoading: boolean;
  onAnalyzeChartAi: () => void;
};

function sectorLabel(sector?: string) {
  switch (sector) {
    case "SEMICONDUCTOR":
      return "반도체";

    case "SECONDARY_BATTERY":
      return "2차전지";

    case "PLATFORM":
      return "플랫폼";

    case "BIO":
      return "바이오";

    case "FINANCE":
      return "금융";

    case "DEFENSE":
      return "방산";

    case "SHIPBUILDING":
      return "조선";

    default:
      return "블라인드 차트";
  }
}
export function TrainingLeftPanel({
  sessionId,
  status,
  accounts,
  accountId,
  setAccountId,
  charts,
  activeChartId,
  setActiveChartId,
  loading,
  onFinishSession,
  loadAccounts,
  progressByChart,
  reviewTargetChartId,
  setReviewTargetChartId,
  chartAiPayload,
  chartAiLoading,
  onAnalyzeChartAi,
}: Props) {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishFailed, setFinishFailed] = useState(false);
  const finishGuard = useRef(false);
  const hasSession = !!sessionId;

  const confirmFinish = async () => {
    if (finishGuard.current) return;
    finishGuard.current = true;
    setFinishFailed(false);
    setFinishing(true);
    try {
      const completed = await onFinishSession();
      if (completed) setFinishDialogOpen(false);
      else setFinishFailed(true);
    } catch {
      setFinishFailed(true);
    } finally {
      finishGuard.current = false;
      setFinishing(false);
    }
  };

  const statusLabel = !hasSession
    ? "대기 중"
    : status === "COMPLETED"
      ? "완료"
      : "진행 중";

  return (
    <aside className="w-[280px] shrink-0 border-r border-border/60 bg-background/40 px-4 py-3">
      <div className="thin-scrollbar flex h-full flex-col overflow-y-auto pr-1">
        <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-muted-foreground">훈련</div>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-base font-semibold">
                  {sessionId ? `#${sessionId}` : "준비 중"}
                </span>

                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    !hasSession
                      ? "bg-muted/40 text-muted-foreground"
                      : status === "COMPLETED"
                        ? "bg-muted/40 text-muted-foreground"
                        : "bg-green-500/10 text-green-400",
                  ].join(" ")}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="border-b border-border/40 py-4">
          <div className="mb-2 text-xs font-semibold text-muted-foreground">
            계좌
          </div>

          <AccountSelectorCard
            accounts={accounts}
            accountId={accountId}
            setAccountId={setAccountId}
            hasSession={hasSession}
            loadAccounts={loadAccounts}
          />
        </section>

        {hasSession && (
          <section className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold text-muted-foreground">
                차트
              </div>
              <div className="text-[11px] text-muted-foreground">
                블라인드 훈련
              </div>
            </div>

            <div className="space-y-2">
              {charts.map((c) => {
                const chartProgress = progressByChart?.[c.chartId] ?? null;
                const { current: progress, total } =
                  getTrainingProgressDisplay(c, chartProgress);
                const pct = Math.min(100, Math.round((progress / total) * 100));

                const isActive = activeChartId === c.chartId;
                const isDone = status === "COMPLETED" || progress >= total;

                return (
                  <button
                    key={c.chartId}
                    onClick={() => setActiveChartId(c.chartId)}
                    className={[
                      "w-full rounded-xl px-3 py-2.5 text-left transition",
                      isActive
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-background/40",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            Chart {c.chartIndex + 1} -
                          </span>

                          <span className="text-sm font-semibold text-foreground">
                            {sectorLabel(c.trainingSector)}
                          </span>
                        </div>

                        {isDone && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            완료된 차트
                          </div>
                        )}
                      </div>

                      <span className="text-muted-foreground">
                        {progress}/{total} · {pct}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {hasSession && (
          <AiReviewPanel
            charts={charts}
            reviewTargetChartId={reviewTargetChartId}
            setReviewTargetChartId={setReviewTargetChartId}
            chartAiPayload={chartAiPayload}
            chartAiLoading={chartAiLoading}
            onAnalyzeChartAi={onAnalyzeChartAi}
            disabled={loading || !reviewTargetChartId}
          />
        )}

        {hasSession && (
          <section className="mt-auto space-y-2 border-t border-border/40 py-4">
            <button
              onClick={() => {
                setFinishFailed(false);
                setFinishDialogOpen(true);
              }}
              disabled={loading || status === "COMPLETED"}
              className="w-full rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              훈련 종료
            </button>
          </section>
        )}
      </div>
      {finishDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="finish-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="훈련 종료 확인 닫기"
            disabled={finishing}
            onClick={() => setFinishDialogOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/45 bg-background p-6 shadow-2xl">
            <h2 id="finish-dialog-title" className="text-lg font-bold">
              훈련을 종료하시겠습니까?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              훈련을 종료하면 다시 진행할 수 없습니다.<br />
              현재 보유 중인 포지션이 있다면 종료 시 자동으로 청산됩니다.
            </p>
            {finishFailed && (
              <p role="alert" className="mt-3 text-sm text-red-300">
                훈련 종료에 실패했습니다. 잠시 후 다시 시도해주세요.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={finishing}
                onClick={() => setFinishDialogOpen(false)}
                className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-background/60 hover:text-foreground disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={finishing}
                onClick={confirmFinish}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500/90 disabled:opacity-50"
              >
                {finishing ? "종료 중..." : "훈련 종료"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

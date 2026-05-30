import { AccountSelectorCard } from "@/components/training/account/AccountSelectorCard";
import type { ProgressMap } from "@/hooks/training/training.types";

type Props = {
  sessionId: number | null;
  status: TrainingStatus;

  accounts: PaperAccountDto[];
  accountId: number | null;
  setAccountId: Dispatch<SetStateAction<number | null>>;

  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;

  syncNext: boolean;
  setSyncNext: Dispatch<SetStateAction<boolean>>;

  charts: TrainingChartDto[];
  activeChartId: number | null;
  setActiveChartId: Dispatch<SetStateAction<number | null>>;

  loading: boolean;

  onFinishSession: () => void;

  onAnalyzeSessionAi: () => void;

  sessionAiLoading: boolean;
  sessionAiExists: boolean;

  loadAccounts: (selectAccountId?: number) => Promise<void>;

  progressByChart: ProgressMap;
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
  viewMode,
  setViewMode,
  syncNext,
  setSyncNext,
  charts,
  activeChartId,
  setActiveChartId,
  loading,
  onFinishSession,
  onAnalyzeSessionAi,
  sessionAiLoading,
  sessionAiExists,
  loadAccounts,
  progressByChart,
}: Props) {
  const hasSession = !!sessionId;

  const statusLabel = !hasSession
    ? "대기 중"
    : status === "COMPLETED"
      ? "완료"
      : "진행 중";

  return (
    <aside className="w-[280px] shrink-0 border-r border-border/60 bg-background/40 px-4 py-3">
      <div className="thin-scrollbar h-full overflow-y-auto pr-1">
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
          <section className="border-b border-border/40 py-4">
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
                const progress =
                  progressByChart[c.chartId]?.progressIndex ??
                  c.progressIndex ??
                  0;
                const total = Math.max(c.bars - 1, 1);
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
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium">
                            {sectorLabel(c.trainingSector)}
                          </div>

                          <div className="text-[10px] text-muted-foreground">
                            Chart {c.chartIndex + 1}
                          </div>
                        </div>

                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[10px]",
                            isDone
                              ? "bg-muted/40 text-muted-foreground"
                              : "bg-green-500/10 text-green-400",
                          ].join(" ")}
                        >
                          {isDone ? "완료" : "진행 중"}
                        </span>
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
          <section className="border-b border-border/40 py-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">
              보기
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/30 hover:bg-background/50"
                }`}
              >
                Grid
              </button>

              <button
                onClick={() => setViewMode("single")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm ${
                  viewMode === "single"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/30 hover:bg-background/50"
                }`}
              >
                Single
              </button>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={syncNext}
                onChange={(e) => setSyncNext(e.target.checked)}
              />
              Grid에서 NEXT 동기 진행
            </label>
          </section>
        )}

        {hasSession && (
          <section className="space-y-2 py-4">
            <button
              onClick={onAnalyzeSessionAi}
              disabled={loading || sessionAiLoading}
              className="w-full rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 disabled:opacity-50"
            >
              {sessionAiLoading
                ? "AI 리포트 생성 중..."
                : sessionAiExists
                  ? "AI 리포트 보기"
                  : "AI 훈련 리포트"}
            </button>

            <button
              onClick={onFinishSession}
              disabled={loading || status === "COMPLETED"}
              className="w-full rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
            >
              훈련 종료
            </button>
          </section>
        )}
      </div>
    </aside>
  );
}

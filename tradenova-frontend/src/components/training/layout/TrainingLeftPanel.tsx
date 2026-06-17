import { AccountSelectorCard } from "@/components/training/account/AccountSelectorCard";
import type { ProgressMap } from "@/hooks/training/training.types";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";
import type { PaperAccountDto, ViewMode } from "@/hooks/training/training.types";

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

  onCreateSession: () => void;
  progressByChart?: ProgressMap;
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

function ScenarioCard({
  charts,
  activeChartId,
  onCreateScenarioSnapshot,
}: {
  charts: TrainingChartDto[];
  activeChartId: number | null;
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
}) {
  const [open, setOpen] = useState(false);

  const [targetChartId, setTargetChartId] = useState<number | null>(
    activeChartId ?? charts[0]?.chartId ?? null,
  );
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    thesis: "",
    entryReason: "",
    exitPlan: "",
    riskNote: "",
    freeNote: "",
  });

  useEffect(() => {
    if (activeChartId) {
      setTargetChartId(activeChartId);
      return;
    }

    if (!targetChartId && charts[0]?.chartId) {
      setTargetChartId(charts[0].chartId);
    }
  }, [activeChartId, charts, targetChartId]);

  const targetChart = charts.find((c) => c.chartId === targetChartId);

  const save = async () => {
    if (!targetChartId) return;

    setSaving(true);
    const saved = await onCreateScenarioSnapshot(targetChartId, form);
    setSaving(false);

    if (!saved) return;

    setOpen(false);
    setForm({
      thesis: "",
      entryReason: "",
      exitPlan: "",
      riskNote: "",
      freeNote: "",
    });
  };

  return (
    <>
      <section className="border-t border-border/35 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground">
            시나리오
          </div>
          <div className="text-[11px] text-muted-foreground">
            AI 분석용 기록
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={charts.length === 0}
          className="w-full rounded-xl border border-border/35 bg-background/25 px-3 py-3 text-left transition hover:border-primary/35 hover:bg-primary/[0.04] disabled:opacity-40"
        >
          <div className="text-sm font-semibold text-foreground">시나리오 작성</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            진입 조건, 무효화 기준, 대응 계획 저장
          </div>
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-background p-5 shadow-2xl">
            <div className="mb-4">
              <div className="text-base font-semibold">시나리오 작성</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {targetChart
                  ? `Chart ${targetChart.chartIndex + 1} · ${sectorLabel(targetChart.trainingSector)}`
                  : "대상 차트 없음"}
              </div>
              <select
                value={targetChartId ?? ""}
                onChange={(e) => setTargetChartId(Number(e.target.value))}
                className="mt-3 h-9 w-full rounded-lg border border-border/40 bg-background/60 px-3 text-xs outline-none focus:border-primary/40"
              >
                {charts.map((chart) => (
                  <option key={chart.chartId} value={chart.chartId}>
                    Chart {chart.chartIndex + 1} · {sectorLabel(chart.trainingSector)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <input
                value={form.thesis}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, thesis: e.target.value }))
                }
                placeholder="관점 요약"
                className="h-9 w-full rounded-lg border border-border/40 bg-background/60 px-3 text-sm outline-none focus:border-primary/40"
              />

              <textarea
                rows={3}
                value={form.entryReason}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, entryReason: e.target.value }))
                }
                placeholder="진입 조건"
                className="w-full resize-none rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/40"
              />

              <textarea
                rows={3}
                value={form.exitPlan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, exitPlan: e.target.value }))
                }
                placeholder="익절/청산 계획"
                className="w-full resize-none rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/40"
              />

              <textarea
                rows={2}
                value={form.riskNote}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, riskNote: e.target.value }))
                }
                placeholder="무효화 기준 / 손절 기준"
                className="w-full resize-none rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/40"
              />

              <textarea
                rows={3}
                value={form.freeNote}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, freeNote: e.target.value }))
                }
                placeholder="추가 메모"
                className="w-full resize-none rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-background/60"
              >
                취소
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving || !form.thesis.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
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
  onCreateScenarioSnapshot,
}: Props) {
  const hasSession = !!sessionId;

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
                const progress =
                  progressByChart?.[c.chartId]?.progressIndex ??
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
          <ScenarioCard
            charts={charts}
            activeChartId={activeChartId}
            onCreateScenarioSnapshot={onCreateScenarioSnapshot}
          />
        )}

        {hasSession && (
          <section className="mt-auto space-y-2 border-t border-border/40 py-4">
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

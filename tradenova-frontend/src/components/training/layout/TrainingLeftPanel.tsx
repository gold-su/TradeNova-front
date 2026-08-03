import { AccountSelectorCard } from "@/components/training/account/AccountSelectorCard";
import type { ProgressMap } from "@/hooks/training/training.types";
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ChevronDown,
  FilePenLine,
  Target,
  ShieldAlert,
  Route,
  StickyNote,
  X,
} from "lucide-react";
import type {
  TrainingChartDto,
  TrainingStatus,
} from "@/types/training";
import type { PaperAccountDto } from "@/hooks/training/training.types";

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
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
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
    if (!open && activeChartId) {
      setTargetChartId(activeChartId);
    }
  }, [activeChartId, open]);

  const targetChart = useMemo(
    () => charts.find((c) => c.chartId === targetChartId) ?? charts[0] ?? null,
    [charts, targetChartId],
  );

  const targetLabel = targetChart
    ? `Chart ${targetChart.chartIndex + 1} · ${sectorLabel(targetChart.trainingSector)}`
    : "차트 선택";

  const save = async () => {
    if (!targetChart?.chartId) return;

    try {
      setSaving(true);
      const saved = await onCreateScenarioSnapshot(targetChart.chartId, form);

      if (!saved) return;

      setOpen(false);
      setChartMenuOpen(false);
      setForm({
        thesis: "",
        entryReason: "",
        exitPlan: "",
        riskNote: "",
        freeNote: "",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="border-t border-border/35 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground">
            시나리오
          </div>
          <div className="text-[11px] text-primary/80">AI 분석용</div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={charts.length === 0}
          className="group w-full overflow-hidden rounded-2xl border border-border/40 bg-background/25 p-3 text-left transition hover:border-primary/40 hover:bg-primary/[0.04] hover:shadow-[0_0_22px_rgba(52,211,153,0.12)] disabled:opacity-40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
              <FilePenLine className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">
                매매 시나리오 기록
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                관점 · 진입 조건 · 손절 기준 · 대응 계획
              </div>
            </div>
          </div>
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border/45 bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border/35 px-5 py-4">
              <div>
                <div className="text-lg font-bold">시나리오 작성</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  저장된 내용은 차트 리뷰와 세션 리포트의 판단 근거로 사용됩니다.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="thin-scrollbar max-h-[72vh] overflow-y-auto px-5 py-4">
              <div className="relative mb-4">
                <button
                  type="button"
                  onClick={() => setChartMenuOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-background/45 px-4 py-3 text-left transition hover:border-primary/35 hover:bg-primary/[0.03]"
                >
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      저장 대상 차트
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">
                      {targetLabel}
                    </div>
                  </div>

                  <ChevronDown
                    className={[
                      "h-4 w-4 text-muted-foreground transition",
                      chartMenuOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {chartMenuOpen && (
                  <div className="absolute left-0 right-0 top-[74px] z-20 overflow-hidden rounded-2xl border border-border/45 bg-background shadow-2xl">
                    {charts.map((chart) => {
                      const selected = chart.chartId === targetChart?.chartId;

                      return (
                        <button
                          key={chart.chartId}
                          type="button"
                          onClick={() => {
                            setTargetChartId(chart.chartId);
                            setChartMenuOpen(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition",
                            selected
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                          ].join(" ")}
                        >
                          <span>
                            Chart {chart.chartIndex + 1} ·{" "}
                            {sectorLabel(chart.trainingSector)}
                          </span>

                          {selected && (
                            <span className="text-[11px] font-semibold">
                              선택됨
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-background/35 p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    핵심 관점
                  </label>
                  <input
                    value={form.thesis}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, thesis: e.target.value }))
                    }
                    placeholder="예: 거래량 증가 후 저항 돌파 시도"
                    className="h-10 w-full rounded-xl border border-border/35 bg-background/60 px-3 text-sm outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45"
                  />
                </div>

                <div className="rounded-2xl bg-background/35 p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                    <FilePenLine className="h-3.5 w-3.5 text-primary" />
                    진입 조건
                  </label>
                  <textarea
                    rows={3}
                    value={form.entryReason}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        entryReason: e.target.value,
                      }))
                    }
                    placeholder="어떤 조건이 나오면 매수/매도할지 적어주세요."
                    className="w-full resize-none rounded-xl border border-border/35 bg-background/60 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-background/35 p-3">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                      <Route className="h-3.5 w-3.5 text-primary" />
                      대응 계획
                    </label>
                    <textarea
                      rows={3}
                      value={form.exitPlan}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          exitPlan: e.target.value,
                        }))
                      }
                      placeholder="익절, 분할매도, 관망 기준"
                      className="w-full resize-none rounded-xl border border-border/35 bg-background/60 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45"
                    />
                  </div>

                  <div className="rounded-2xl bg-background/35 p-3">
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                      <ShieldAlert className="h-3.5 w-3.5 text-red-300" />
                      무효화 기준
                    </label>
                    <textarea
                      rows={3}
                      value={form.riskNote}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          riskNote: e.target.value,
                        }))
                      }
                      placeholder="손절, 실패 조건, 비중 제한"
                      className="w-full resize-none rounded-xl border border-border/35 bg-background/60 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-background/35 p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
                    <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                    추가 메모
                  </label>
                  <textarea
                    rows={3}
                    value={form.freeNote}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, freeNote: e.target.value }))
                    }
                    placeholder="감정, 확신도, 주의할 점 등을 자유롭게 기록"
                    className="w-full resize-none rounded-xl border border-border/35 bg-background/60 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/35 px-5 py-4">
              <div className="text-[11px] text-muted-foreground">
                최소 핵심 관점은 입력해야 저장할 수 있습니다.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
                >
                  취소
                </button>

                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !form.thesis.trim()}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
                >
                  {saving ? "저장 중..." : "시나리오 저장"}
                </button>
              </div>
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

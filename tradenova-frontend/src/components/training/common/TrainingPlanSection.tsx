import { useState } from "react";
import type {
  ReportDocumentResponse,
  TrainingChartDto,
  TrainingEventResponse,
} from "@/types/training";
import { WorkspaceDialog } from "./WorkspaceDialog";
import {
  getScenarioHistory,
  getTradeReasonHistory,
  SCENARIO_FIELDS,
} from "@/hooks/training/trainingDecisionHistory";

type ScenarioContent = {
  thesis: string;
  entryReason: string;
  exitPlan: string;
  riskNote: string;
  freeNote: string;
};
type Props = {
  activeChart: TrainingChartDto | null;
  latestScenario: ReportDocumentResponse | null;
  snapshots: ReportDocumentResponse[];
  events: TrainingEventResponse[];
  onCreateScenario: (
    chartId: number,
    content: ScenarioContent,
  ) => Promise<unknown>;
};
const emptyScenario = (): ScenarioContent => ({
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
});
const tabs = ["작성 / 수정", "시나리오 기록", "매매 근거 기록"] as const;

export function TrainingPlanSection({
  activeChart,
  latestScenario,
  snapshots,
  events,
  onCreateScenario,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ScenarioContent>(emptyScenario);
  const openEditor = () => {
    setForm({
      ...emptyScenario(),
      ...Object.fromEntries(
        SCENARIO_FIELDS.map(({ key }) => [
          key,
          latestScenario?.contentJson[key] ?? "",
        ]),
      ),
    });
    setTab(0);
    setError(null);
    setOpen(true);
  };
  const save = async () => {
    if (!activeChart || !form.thesis.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await onCreateScenario(activeChart.chartId, form);
      if (saved) setOpen(false);
      else setError("시나리오를 저장하지 못했습니다. 다시 시도해주세요.");
    } catch {
      setError("시나리오를 저장하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };
  const scenarios = getScenarioHistory(snapshots, activeChart?.chartId ?? null);
  const trades = getTradeReasonHistory(events, activeChart?.chartId ?? null);
  return (
    <>
      <section className="border-b border-border/35 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
            PLAN
          </h2>
          <button
            type="button"
            onClick={openEditor}
            disabled={!activeChart}
            className="h-8 rounded-md px-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-40"
          >
            {latestScenario ? "시나리오 관리" : "+ 시나리오 작성"}
          </button>
        </div>
        {latestScenario ? (
          <>
            <p className="mb-2 text-xs font-semibold">현재 계획</p>
            <dl className="grid grid-cols-[56px_1fr] gap-x-2 gap-y-1.5 text-xs leading-5">
              {SCENARIO_FIELDS.filter(({ key }) =>
                ["thesis", "entryReason", "riskNote"].includes(key),
              ).map(({ key, label }) => (
                <div key={key} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="line-clamp-2 text-foreground/85">
                    {latestScenario.contentJson[key] || "미작성"}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="py-1 text-xs leading-5 text-muted-foreground">
            아직 작성된 계획이 없습니다.
          </p>
        )}
      </section>
      {open && (
        <WorkspaceDialog
          wide
          title={latestScenario ? "시나리오 관리" : "시나리오 작성"}
          description={`Chart ${(activeChart?.chartIndex ?? 0) + 1} · 계획과 실행의 판단 기록`}
          busy={saving}
          onClose={() => setOpen(false)}
        >
          <div
            role="tablist"
            aria-label="의사결정 기록"
            className="mx-5 flex shrink-0 gap-4 border-b border-border/40"
          >
            {tabs.map((label, index) => (
              <button
                key={label}
                id={`decision-tab-${index}`}
                role="tab"
                aria-selected={tab === index}
                aria-controls={`decision-panel-${index}`}
                tabIndex={tab === index ? 0 : -1}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % 3
                      : event.key === "ArrowLeft"
                        ? (index + 2) % 3
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    setTab(next);
                    document.getElementById(`decision-tab-${next}`)?.focus();
                  }
                }}
                onClick={() => setTab(index)}
                className={`border-b-2 py-2.5 text-xs font-semibold ${tab === index ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`decision-panel-${tab}`}
            aria-labelledby={`decision-tab-${tab}`}
            className="thin-scrollbar min-h-[280px] overflow-y-auto px-5 py-4"
          >
            {tab === 0 && (
              <fieldset disabled={saving} className="space-y-3">
                {SCENARIO_FIELDS.map(({ key, label, example }) => (
                  <label key={key} className="block">
                    <span className="mb-1.5 block text-xs font-semibold">
                      {label}
                      {key === "thesis"
                        ? " *"
                        : key === "freeNote"
                          ? " (선택)"
                          : ""}
                    </span>
                    <textarea
                      rows={2}
                      value={form[key]}
                      placeholder={example}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          [key]: event.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-xs leading-5 outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
                    />
                  </label>
                ))}
                {error && (
                  <p role="alert" className="text-xs text-red-300">
                    {error}
                  </p>
                )}
              </fieldset>
            )}
            {tab === 1 && (
              <div className="divide-y divide-border/30">
                {scenarios.length === 0 ? (
                  <Empty>저장된 시나리오가 없습니다.</Empty>
                ) : (
                  scenarios.map((scenario, index) => (
                    <article key={scenario.id} className="py-3 first:pt-0">
                      <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
                        <time>
                          {new Date(scenario.createdAt).toLocaleString("ko-KR")}
                        </time>
                        {index === 0 && (
                          <span className="text-primary">현재 계획</span>
                        )}
                      </div>
                      <dl className="space-y-2">
                        {SCENARIO_FIELDS.filter(({ key }) =>
                          scenario.contentJson[key]?.trim(),
                        ).map(({ key, label }) => (
                          <div key={key}>
                            <dt className="text-[10px] text-muted-foreground">
                              {label}
                            </dt>
                            <dd className="whitespace-pre-wrap break-words text-xs leading-5">
                              {scenario.contentJson[key]}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  ))
                )}
              </div>
            )}
            {tab === 2 && (
              <>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  현재 불러온 차트 이벤트 내의 매매 근거입니다.
                </p>
                <div className="divide-y divide-border/30">
                  {trades.length === 0 ? (
                    <Empty>기록된 매매 근거가 없습니다.</Empty>
                  ) : (
                    trades.map((trade) => (
                      <article key={trade.id} className="py-3 first:pt-0">
                        <div className="flex items-center justify-between">
                          <strong
                            className={`text-xs ${trade.side === "BUY" ? "text-primary" : "text-red-300"}`}
                          >
                            {trade.side}
                          </strong>
                          <time className="text-[11px] text-muted-foreground">
                            {new Date(trade.createdAt).toLocaleString("ko-KR")}
                          </time>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {trade.label}
                        </p>
                        {trade.reasons.map((reason, index) => (
                          <div key={index} className="mt-3">
                            <p className="text-xs font-medium">
                              {reason.title}
                            </p>
                            <p className="whitespace-pre-wrap break-words text-xs leading-5 text-foreground/75">
                              {reason.entryReason}
                            </p>
                            {reason.riskNote && (
                              <p className="mt-1 whitespace-pre-wrap text-xs text-red-300">
                                {reason.riskNote}
                              </p>
                            )}
                          </div>
                        ))}
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
          {tab === 0 && (
            <footer className="flex shrink-0 items-center justify-between border-t border-border/35 px-5 py-3">
              <span className="text-[10px] text-muted-foreground">
                수정 시 새 기록으로 저장됩니다.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                  className="h-9 px-3 text-xs text-muted-foreground"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !form.thesis.trim()}
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {saving ? "저장 중..." : "시나리오 저장"}
                </button>
              </div>
            </footer>
          )}
        </WorkspaceDialog>
      )}
    </>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-10 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}

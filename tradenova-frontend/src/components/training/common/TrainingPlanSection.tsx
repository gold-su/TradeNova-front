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
const tabs = ["작성 / 수정", "시나리오 기록", "매매 근거 기록"] as const;
const emptyScenario = (): ScenarioContent => ({
  thesis: "",
  entryReason: "",
  exitPlan: "",
  riskNote: "",
  freeNote: "",
});
const time = (value: string) =>
  new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

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
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<ScenarioContent>(emptyScenario);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scenarios = getScenarioHistory(snapshots, activeChart?.chartId ?? null);
  const trades = getTradeReasonHistory(events, activeChart?.chartId ?? null);
  const versionOf = (id: number) => {
    const index = scenarios.findIndex((scenario) => scenario.id === id);
    return index < 0 ? null : `v${scenarios.length - index}`;
  };
  const openEditor = () => {
    setForm(emptyScenario());
    setTab(0);
    setError(null);
    setSuccess(null);
    setExpandedId(null);
    setOpen(true);
  };
  const loadCurrent = () => {
    if (!latestScenario) return;
    setForm({
      thesis: latestScenario?.contentJson.thesis ?? "",
      entryReason: latestScenario?.contentJson.entryReason ?? "",
      exitPlan: latestScenario?.contentJson.exitPlan ?? "",
      riskNote: latestScenario?.contentJson.riskNote ?? "",
      freeNote: latestScenario?.contentJson.freeNote ?? "",
    });
    setError(null);
    setSuccess(null);
  };
  const save = async () => {
    if (!activeChart || !form.thesis.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await onCreateScenario(activeChart.chartId, form);
      if (saved) {
        setForm(emptyScenario());
        setSuccess(`v${scenarios.length + 1} 계획이 저장되었습니다.`);
      } else setError("계획을 저장하지 못했습니다. 다시 시도해주세요.");
    } catch {
      setError("계획을 저장하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <section className="border-b border-border/30 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">
              PLAN{" "}
              <span className="font-normal text-muted-foreground">
                · 현재 계획
              </span>
            </h2>
            {latestScenario && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {versionOf(latestScenario.id)} ·{" "}
                {time(latestScenario.createdAt)} 저장
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openEditor}
            disabled={!activeChart}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-40"
          >
            {latestScenario ? "계획 관리" : "+ 첫 계획 작성"}
          </button>
        </div>
        {latestScenario ? (
          <div className="mt-2.5 space-y-1 text-[13px] leading-5">
            <p className="line-clamp-2 text-foreground/90">
              {latestScenario.contentJson.thesis}
            </p>
            {latestScenario.contentJson.entryReason && (
              <p className="line-clamp-1 text-muted-foreground">
                진입: {latestScenario.contentJson.entryReason}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
            아직 작성된 계획이 없습니다.
          </p>
        )}
      </section>
      {open && (
        <WorkspaceDialog
          wide
          title="시나리오 관리"
          description={`Chart ${(activeChart?.chartIndex ?? 0) + 1} · 계획과 실행의 판단 기록`}
          busy={saving}
          onClose={() => setOpen(false)}
        >
          <div
            role="tablist"
            aria-label="의사결정 기록"
            className="mx-6 flex shrink-0 gap-5 border-b border-border/40"
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
                className={`border-b-2 py-3 text-xs font-semibold ${tab === index ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`decision-panel-${tab}`}
            aria-labelledby={`decision-tab-${tab}`}
            className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4"
          >
            {tab === 0 && (
              <fieldset disabled={saving} className="space-y-3.5">
                {SCENARIO_FIELDS.map(
                  ({ key, label, helper, example }, index) => (
                    <label key={key} className="block">
                      <span className="flex items-baseline gap-2">
                        <span className="w-5 text-[11px] tabular-nums text-muted-foreground">
                          {key === "freeNote" ? "·" : `0${index + 1}`}
                        </span>
                        <span className="text-sm font-semibold">
                          {label}
                          {key === "thesis" && (
                            <span className="text-primary"> *</span>
                          )}
                        </span>
                      </span>
                      <span className="mb-1 ml-7 block text-xs leading-5 text-muted-foreground">
                        {helper}
                      </span>
                      <textarea
                        rows={key === "freeNote" ? 2 : 1}
                        value={form[key]}
                        placeholder={example}
                        onChange={(event) => {
                          setSuccess(null);
                          setForm((prev) => ({
                            ...prev,
                            [key]: event.target.value,
                          }));
                        }}
                        className="ml-7 w-[calc(100%-1.75rem)] resize-y rounded-md border border-border/55 bg-muted/15 px-3 py-2 text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground/75 focus:border-primary/65"
                      />
                    </label>
                  ),
                )}
                {error && (
                  <p role="alert" className="text-xs text-red-300">
                    {error}
                  </p>
                )}
                {success && (
                  <p role="status" className="text-xs font-medium text-primary">
                    {success}
                  </p>
                )}
              </fieldset>
            )}
            {tab === 1 && (
              <div className="space-y-0.5">
                {scenarios.length === 0 ? (
                  <Empty
                    title="아직 저장된 계획이 없습니다."
                    detail="계획을 작성하면 변경 이력이 시간순으로 기록됩니다."
                  />
                ) : (
                  scenarios.map((scenario, index) => (
                    <article
                      key={scenario.id}
                      className="border-b border-border/25 py-3.5 first:pt-0 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">
                          v{scenarios.length - index}
                        </strong>
                        {index === 0 && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            현재 계획
                          </span>
                        )}
                        <time className="ml-auto text-[11px] text-muted-foreground">
                          {time(scenario.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 truncate text-[13px] leading-5">
                        {scenario.contentJson.thesis || "관점 미작성"}
                      </p>
                      <p className="mt-0.5 truncate text-xs leading-5 text-muted-foreground">
                        진입:{" "}
                        {scenario.contentJson.entryReason || "조건 미작성"}
                      </p>
                      <button
                        type="button"
                        aria-expanded={expandedId === scenario.id}
                        onClick={() =>
                          setExpandedId((id) =>
                            id === scenario.id ? null : scenario.id,
                          )
                        }
                        className="mt-2 text-xs font-medium text-foreground/80 hover:text-primary"
                      >
                        {expandedId === scenario.id ? "상세 접기" : "상세 보기"}
                      </button>
                      {expandedId === scenario.id && (
                        <dl className="mt-3 grid grid-cols-[72px_1fr] gap-x-2 gap-y-2 border-l border-border/50 pl-3 text-xs leading-5">
                          {SCENARIO_FIELDS.map(({ key, label }) => (
                            <div key={key} className="contents">
                              <dt className="text-muted-foreground">{label}</dt>
                              <dd className="whitespace-pre-wrap break-words">
                                {scenario.contentJson[key] || "—"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </article>
                  ))
                )}
              </div>
            )}
            {tab === 2 && (
              <div className="space-y-0.5">
                {trades.length === 0 ? (
                  <Empty
                    title="아직 기록된 매매 근거가 없습니다."
                    detail="BUY 또는 SELL 후 작성한 판단이 여기에 표시됩니다."
                  />
                ) : (
                  trades.map((trade) => (
                    <article
                      key={trade.id}
                      className="border-b border-border/25 py-3.5 first:pt-0 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <strong
                          className={`text-sm ${trade.side === "BUY" ? "text-primary" : "text-red-300"}`}
                        >
                          {trade.side}
                        </strong>
                        <time className="ml-auto text-[11px] text-muted-foreground">
                          {time(trade.createdAt)}
                        </time>
                      </div>
                      {(trade.price != null || trade.qty != null) && (
                        <p className="mt-1 text-xs text-foreground/85">
                          {[
                            trade.price != null
                              ? `${trade.price.toLocaleString()}원`
                              : null,
                            trade.qty != null
                              ? `${trade.qty.toLocaleString()}주`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {trade.scenarioId != null
                          ? `PLAN ${versionOf(trade.scenarioId) ?? "연결"}`
                          : trade.label}
                        {trade.scenarioId != null &&
                        trade.label.includes("추가 근거")
                          ? ` · ${trade.label.split(" · ")[1]}`
                          : ""}
                      </p>
                      {trade.reasons.map((reason, index) => (
                        <p
                          key={index}
                          className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-5 text-foreground/85"
                        >
                          {reason.entryReason || reason.title}
                          {reason.riskNote && (
                            <span className="block text-xs text-red-300">
                              {reason.riskNote}
                            </span>
                          )}
                        </p>
                      ))}
                    </article>
                  ))
                )}
              </div>
            )}
          </div>
          {tab === 0 && (
            <footer className="flex shrink-0 items-center justify-between border-t border-border/30 px-6 py-3">
              <button
                type="button"
                onClick={loadCurrent}
                disabled={saving || !latestScenario}
                className="text-xs font-medium text-muted-foreground hover:text-primary disabled:opacity-40"
              >
                현재 계획 불러오기
              </button>
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
                  className="h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {saving ? "저장 중..." : "새 버전 저장"}
                </button>
              </div>
            </footer>
          )}
        </WorkspaceDialog>
      )}
    </>
  );
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

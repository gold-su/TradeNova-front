import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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
import {
  emptyScenario,
  scenarioDraftForChart,
  storeScenarioDraft,
  type ScenarioContent,
} from "./scenarioDraftState";
import { resizeScenarioTextarea } from "./scenarioTextarea";
import {
  CURRENT_VIEW_OPTIONS,
  fromDecisionCaptureContent,
  INVALIDATION_ACTION_OPTIONS,
  isDecisionCaptureComplete,
} from "@/hooks/training/decisionCapture";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  charts: TrainingChartDto[];
  activeChart: TrainingChartDto | null;
  onSelectChart: (chartId: number) => void;
  latestScenario: ReportDocumentResponse | null;
  snapshots: ReportDocumentResponse[];
  events: TrainingEventResponse[];
  onCreateScenario: (
    chartId: number,
    content: ScenarioContent,
  ) => Promise<unknown>;
};
function AutoGrowTextarea({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (ref.current) resizeScenarioTextarea(ref.current);
  }, [value]);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    const resize = () => resizeScenarioTextarea(textarea);
    window.addEventListener("resize", resize);
    void document.fonts?.ready.then(resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onInput={(event) => resizeScenarioTextarea(event.currentTarget)}
      onChange={onChange}
      className="min-h-[38px] max-h-40 w-full resize-none overflow-y-hidden rounded-md border border-border/55 bg-muted/15 px-3.5 py-2 text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground/75 focus:border-primary/65"
    />
  );
}

export function TrainingPlanSection({
  charts,
  activeChart,
  onSelectChart,
  latestScenario,
  snapshots,
  events,
  onCreateScenario,
}: Props) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const tabs = [t("training.planUi.write"), t("training.planUi.history"), t("training.planUi.tradeHistory")];
  const time = (value: string) => new Date(value).toLocaleString(locale, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const currentViewLabel = (value?: string) => value === "BULLISH" ? t("training.plan.bullish") : value === "BEARISH" ? t("training.plan.bearish") : value === "NEUTRAL" ? t("training.plan.neutral") : value ?? "—";
  const invalidationActionLabel = (value?: string) => value === "EXIT" ? t("training.plan.exit") : value === "REDUCE" ? t("training.plan.reduce") : value === "WAIT" ? t("training.plan.wait") : value === "REASSESS" ? t("training.plan.reassess") : value ?? "—";
  const relationLabel = (value?: string | null) => value === "FOLLOWED_PLAN" ? t("training.relation.followed") : value === "CHANGED_PLAN" ? t("training.relation.changed") : value === "UNPLANNED" ? t("training.relation.unplanned") : t("training.planUi.actionRecorded");
  const currentViewOptions = CURRENT_VIEW_OPTIONS.map((option) => ({ ...option, label: currentViewLabel(option.value) }));
  const invalidationActionOptions = INVALIDATION_ACTION_OPTIONS.map((option) => ({ ...option, label: invalidationActionLabel(option.value) }));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<ScenarioContent>(emptyScenario);
  const [draftsByChart, setDraftsByChart] = useState<Record<number, ScenarioContent>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scenarios = getScenarioHistory(snapshots, activeChart?.chartId ?? null);
  const trades = getTradeReasonHistory(events, activeChart?.chartId ?? null);
  const versionOf = (id: number) => {
    const index = scenarios.findIndex((scenario) => scenario.id === id);
    return index < 0 ? null : `v${scenarios.length - index}`;
  };
  const openEditor = () => {
    const initial = emptyScenario();
    setForm(initial);
    setDraftsByChart(activeChart ? { [activeChart.chartId]: initial } : {});
    setTab(0);
    setError(null);
    setSuccess(null);
    setExpandedId(null);
    setOpen(true);
  };
  const loadCurrent = () => {
    if (!latestScenario) return;
    const current = fromDecisionCaptureContent(latestScenario.contentJson);
    setForm(current);
    if (activeChart) {
      setDraftsByChart((prev) => storeScenarioDraft(prev, activeChart.chartId, current));
    }
    setError(null);
    setSuccess(null);
  };
  const save = async () => {
    if (!activeChart || !isDecisionCaptureComplete(form) || saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await onCreateScenario(activeChart.chartId, form);
      if (saved) {
        const next = emptyScenario();
        setForm(next);
        setDraftsByChart((prev) => storeScenarioDraft(prev, activeChart.chartId, next));
        setSuccess(t("training.planUi.savedVersion", { version: scenarios.length + 1 }));
      } else setError(t("training.plan.saveFailed"));
    } catch {
      setError(t("training.plan.saveFailed"));
    } finally {
      setSaving(false);
    }
  };
  const selectChart = (chartId: number) => {
    if (saving || chartId === activeChart?.chartId) return;
    setForm(scenarioDraftForChart(draftsByChart, chartId));
    setError(null);
    setSuccess(null);
    setExpandedId(null);
    onSelectChart(chartId);
  };
  const updateForm = (next: ScenarioContent) => {
    setSuccess(null);
    setForm(next);
    if (activeChart) {
      setDraftsByChart((drafts) =>
        storeScenarioDraft(drafts, activeChart.chartId, next),
      );
    }
  };
  return (
    <>
      <section className="border-b border-border/30 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.14em] text-primary/80">
              01 · PLAN
            </div>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="text-sm font-semibold">{t("training.plan.manage")}</h2>
              {latestScenario && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {t("training.planUi.savedBadge")}
                </span>
              )}
            </div>
            {latestScenario && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {versionOf(latestScenario.id)} ·{" "}
                {time(latestScenario.createdAt)} {t("training.planUi.savedAt")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={openEditor}
            disabled={!activeChart}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-40"
          >
            {latestScenario ? t("training.planUi.edit") : `+ ${t("training.planUi.create")}`}
          </button>
        </div>
        {latestScenario ? (
          <dl className="mt-3 grid grid-cols-[52px_1fr] gap-x-2 gap-y-1.5 border-l border-primary/30 pl-3 text-xs leading-[18px]">
            <dt className="text-muted-foreground">{t("training.planUi.view")}</dt>
            <dd className="truncate font-medium text-foreground/90">
              {currentViewLabel(
                latestScenario.contentJson.currentView ?? latestScenario.contentJson.thesis,
              )}
            </dd>
            <dt className="text-muted-foreground">{t("training.planUi.entryShort")}</dt>
            <dd className="line-clamp-1 text-foreground/80">
              {latestScenario.contentJson.entryCondition ??
                latestScenario.contentJson.entryReason ??
                "—"}
            </dd>
            <dt className="text-muted-foreground">{t("training.planUi.invalidationShort")}</dt>
            <dd className="line-clamp-1 text-foreground/80">
              {latestScenario.contentJson.invalidationCondition ??
                latestScenario.contentJson.riskNote ??
                "—"}
            </dd>
            <dt className="text-muted-foreground">{t("training.planUi.response")}</dt>
            <dd className="truncate text-foreground/80">
              {invalidationActionLabel(
                latestScenario.contentJson.ifInvalidated ?? latestScenario.contentJson.exitPlan,
              )}
            </dd>
          </dl>
        ) : (
          <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
            {t("training.planUi.intro")}
          </p>
        )}
      </section>
      {open && (
        <WorkspaceDialog
          wide
          title={t("training.plan.manage")}
          description={`Chart ${(activeChart?.chartIndex ?? 0) + 1} · ${t("training.planUi.dialogDescription")}`}
          busy={saving}
          onClose={() => setOpen(false)}
        >
          {charts.length > 1 && (
            <div className="mx-6 mt-3 shrink-0">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
                {t("training.plan.context")}
              </p>
              <div
                className="mt-2 flex flex-wrap gap-1 rounded-lg border border-border/40 bg-muted/10 p-1"
                role="group"
                aria-label={t("training.planUi.chartSelector")}
              >
                {charts.map((chart) => {
                  const selected = chart.chartId === activeChart?.chartId;
                  return (
                    <button
                      key={chart.chartId}
                      type="button"
                      aria-pressed={selected}
                      disabled={saving}
                      onClick={() => selectChart(chart.chartId)}
                      className={`min-w-0 basis-[calc(50%-0.125rem)] rounded-md border px-3 py-2 text-xs font-semibold transition sm:flex-1 sm:basis-auto disabled:opacity-50 ${selected ? "border-primary/35 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:bg-muted/35 hover:text-foreground"}`}
                    >
                      Chart {chart.chartIndex + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div
            role="tablist"
            aria-label={t("training.planUi.tabsLabel")}
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
                className={`border-b-2 py-4 text-sm font-semibold ${tab === index ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`decision-panel-${tab}`}
            aria-labelledby={`decision-tab-${tab}`}
            className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-2.5"
          >
            {tab === 0 && (
              <fieldset disabled={saving} className="space-y-5">
                <DecisionChoice
                  label={t("training.plan.currentView")}
                  helper={t("training.plan.currentViewQuestion")}
                  value={form.thesis}
                  options={currentViewOptions}
                  onChange={(value) => updateForm({ ...form, thesis: value })}
                />
                {SCENARIO_FIELDS.map(({ key }) => (
                  <label key={key} className="block">
                    <span className="text-sm font-semibold">
                      {key === "entryReason" ? t("training.plan.entryCondition") : t("training.plan.invalidationCondition")}
                      <span className="text-primary"> *</span>
                    </span>
                    <span className="mb-1.5 mt-1 block text-xs leading-5 text-muted-foreground">
                      {key === "entryReason" ? t("training.plan.entryQuestion") : t("training.plan.invalidationQuestion")}
                    </span>
                    <AutoGrowTextarea
                      value={form[key]}
                      placeholder={key === "entryReason" ? t("training.plan.entryPlaceholder") : t("training.plan.invalidationPlaceholder")}
                      onChange={(event) =>
                        updateForm({ ...form, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}
                <DecisionChoice
                  label={t("training.plan.ifInvalidated")}
                  helper={t("training.plan.invalidatedQuestion")}
                  value={form.exitPlan}
                  options={invalidationActionOptions}
                  onChange={(value) => updateForm({ ...form, exitPlan: value })}
                />
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
                    title={t("training.planUi.noPlanHistory")}
                    detail={t("training.planUi.noPlanHistoryDetail")}
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
                            {t("training.planUi.currentPlan")}
                          </span>
                        )}
                        <time className="ml-auto text-[11px] text-muted-foreground">
                          {time(scenario.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 truncate text-[13px] leading-5">
                        {currentViewLabel(
                          scenario.contentJson.currentView ?? scenario.contentJson.thesis,
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs leading-5 text-muted-foreground">
                        {t("training.planUi.entryPrefix")}:{" "}
                        {scenario.contentJson.entryReason || t("training.planUi.conditionMissing")}
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
                        {expandedId === scenario.id ? t("training.planUi.collapse") : t("training.planUi.expand")}
                      </button>
                      {expandedId === scenario.id && (
                        <dl className="mt-3 grid grid-cols-[72px_1fr] gap-x-2 gap-y-2 border-l border-border/50 pl-3 text-xs leading-5">
                          <dt className="text-muted-foreground">{t("training.plan.currentView")}</dt>
                          <dd>{currentViewLabel(scenario.contentJson.currentView ?? scenario.contentJson.thesis)}</dd>
                          <dt className="text-muted-foreground">{t("training.plan.entryCondition")}</dt>
                          <dd className="whitespace-pre-wrap break-words">{scenario.contentJson.entryCondition ?? scenario.contentJson.entryReason ?? "—"}</dd>
                          <dt className="text-muted-foreground">{t("training.plan.invalidationCondition")}</dt>
                          <dd className="whitespace-pre-wrap break-words">{scenario.contentJson.invalidationCondition ?? scenario.contentJson.riskNote ?? "—"}</dd>
                          <dt className="text-muted-foreground">{t("training.plan.ifInvalidated")}</dt>
                          <dd>{invalidationActionLabel(scenario.contentJson.ifInvalidated ?? scenario.contentJson.exitPlan)}</dd>
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
                    title={t("training.planUi.noActionHistory")}
                    detail={t("training.planUi.noActionHistoryDetail")}
                  />
                ) : (
                  trades.map((trade) => (
                    <article
                      key={trade.id}
                      className="border-b border-border/25 py-3.5 first:pt-0 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <strong
                          className={`text-sm ${trade.side === "BUY" ? "text-primary" : trade.side === "SELL" ? "text-red-300" : "text-sky-300"}`}
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
                              ? `₩${trade.price.toLocaleString(locale)}`
                              : null,
                            trade.qty != null
                              ? t("training.chart.shares", { count: trade.qty.toLocaleString(locale) })
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {trade.scenarioId != null
                          ? `PLAN ${versionOf(trade.scenarioId) ?? t("training.planUi.linked")}`
                          : t("training.planUi.noPlan")}
                        {trade.scenarioId != null && trade.manualCount > 0
                          ? ` · ${t("training.planUi.additionalReasons", { count: trade.manualCount })}`
                          : ""}
                      </p>
                      {trade.planRelation && (
                        <p className="mt-1 text-[11px] font-medium text-foreground/75">
                          {relationLabel(trade.planRelation)}
                          {trade.planRelation === "CHANGED_PLAN" && trade.changeReason
                            ? ` · ${trade.changeReason}`
                            : ""}
                        </p>
                      )}
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
                {t("training.plan.loadCurrent")}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                  className="h-9 px-3 text-sm text-muted-foreground"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !isDecisionCaptureComplete(form)}
                  className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {saving ? t("common.saving") : latestScenario ? t("training.planUi.newVersion") : t("training.plan.save")}
                </button>
              </div>
            </footer>
          )}
        </WorkspaceDialog>
      )}
    </>
  );
}
function DecisionChoice<T extends string>({
  label,
  helper,
  value,
  options,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <span className="text-sm font-semibold">
        {label}<span className="text-primary"> *</span>
      </span>
      <p className="mb-2 mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
      <div className={`grid grid-cols-2 gap-1.5 ${options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`h-9 rounded-md border px-2 text-xs font-semibold transition ${
              value === option.value
                ? "border-primary/45 bg-primary/10 text-primary"
                : "border-border/45 bg-muted/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
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

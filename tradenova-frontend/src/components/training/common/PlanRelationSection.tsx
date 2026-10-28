import { useState, type Dispatch, type SetStateAction } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { ReportDocumentResponse } from "@/types/training";
import type { TradeForm } from "@/hooks/training/training.types";
import {
  selectPlanRelation,
  selectTradeScenario,
} from "@/hooks/training/trainingTradeReason";
import {
  PLAN_RELATION_OPTIONS,
} from "@/hooks/training/decisionCapture";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  tradeForm: TradeForm;
  setTradeForm: Dispatch<SetStateAction<TradeForm>>;
  scenarios: ReportDocumentResponse[];
  disabled?: boolean;
};

export function PlanRelationSection({ tradeForm, setTradeForm, scenarios, disabled }: Props) {
  const { t } = useI18n();
  const relationCopy = (value: string) => {
    if (value === "FOLLOWED_PLAN") return { label: t("training.relation.followed"), description: t("training.relation.followedDescription") };
    if (value === "CHANGED_PLAN") return { label: t("training.relation.changed"), description: t("training.relation.changedDescription") };
    return { label: t("training.relation.unplanned"), description: t("training.relation.unplannedDescription") };
  };
  const currentViewLabel = (value?: string) => value === "BULLISH" ? t("training.plan.bullish") : value === "BEARISH" ? t("training.plan.bearish") : value === "NEUTRAL" ? t("training.plan.neutral") : value ?? "—";
  const [planOpen, setPlanOpen] = useState(false);
  const selectedIndex = scenarios.findIndex((item) => item.id === tradeForm.scenarioSnapshotId);
  const selectedPlan = selectedIndex >= 0 ? scenarios[selectedIndex] : null;
  const selectedVersion = selectedIndex >= 0 ? scenarios.length - selectedIndex : null;

  return (
    <section className="border-t border-border/30 pt-4">
      <div className="mb-3">
        <div className="text-[10px] font-bold tracking-[0.14em] text-primary/80">
          02 · ACTION
        </div>
        <h3 className="mt-1 text-sm font-semibold">{t("training.relation.question")}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {t("training.relation.help")}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {PLAN_RELATION_OPTIONS.map((relation) => {
          const needsPlan = relation.value !== "UNPLANNED";
          return (
            <button
              key={relation.value}
              type="button"
              aria-pressed={tradeForm.planRelation === relation.value}
              disabled={disabled || (needsPlan && scenarios.length === 0)}
              title={needsPlan && scenarios.length === 0 ? t("training.relation.planRequired") : undefined}
              onClick={() => {
                setPlanOpen(false);
                setTradeForm((previous) =>
                  selectPlanRelation(previous, relation.value, scenarios),
                );
              }}
              className={`min-h-[54px] rounded-md border px-2 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-35 ${
                tradeForm.planRelation === relation.value
                  ? "border-primary/45 bg-primary/10 text-primary"
                  : "border-border/45 bg-muted/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block font-semibold">{relationCopy(relation.value).label}</span>
              <span className="mt-0.5 block text-[10px] font-normal leading-3.5 opacity-75">
                {relationCopy(relation.value).description}
              </span>
            </button>
          );
        })}
      </div>

      {tradeForm.planRelation && tradeForm.planRelation !== "UNPLANNED" && (
        <div className="mt-3">
          {selectedPlan && (
            <div className="flex items-start justify-between gap-3 border-l border-primary/30 pl-3 text-xs leading-5">
              <div className="min-w-0">
                <p className="font-medium text-foreground/85">
                  {selectedIndex === 0 ? t("training.relation.latestPlan") : t("training.relation.selectedPlan")} · v
                  {selectedVersion}
                </p>
                <p className="truncate text-muted-foreground">
                  {currentViewLabel(
                    selectedPlan.contentJson.currentView ?? selectedPlan.contentJson.thesis,
                  )}
                  {" · "}
                  {selectedPlan.contentJson.entryCondition ??
                    selectedPlan.contentJson.entryReason ??
                    t("training.relation.missingEntry")}
                </p>
              </div>
              {scenarios.length > 1 && (
                <div
                  className="relative shrink-0"
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setPlanOpen(false);
                  }}
                >
                  <button
                    id="trade-plan"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={planOpen}
                    disabled={disabled}
                    onClick={() => setPlanOpen((open) => !open)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-40"
                  >
                    {t("training.relation.otherPlan")}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {planOpen && (
                    <div
                      role="listbox"
                      className="thin-scrollbar absolute right-0 top-[calc(100%+4px)] z-20 max-h-48 w-64 overflow-y-auto rounded-md border border-border/75 bg-popover p-1 shadow-xl shadow-black/40"
                    >
                      {scenarios.map((scenario, index) => (
                        <button
                          key={scenario.id}
                          type="button"
                          role="option"
                          aria-selected={selectedPlan.id === scenario.id}
                          onClick={() => {
                            setTradeForm((previous) =>
                              selectTradeScenario(previous, scenario.id, scenarios),
                            );
                            setPlanOpen(false);
                          }}
                          className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[13px] hover:bg-primary/10 hover:text-primary"
                        >
                          <span className="truncate">
                            v{scenarios.length - index} · {currentViewLabel(
                              scenario.contentJson.currentView ?? scenario.contentJson.thesis,
                            )}
                          </span>
                          {selectedPlan.id === scenario.id && (
                            <Check className="h-4 w-4 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tradeForm.planRelation === "CHANGED_PLAN" && (
        <label className="mt-3 block text-xs font-semibold text-muted-foreground">
          {t("training.relation.changedReason")} <span className="text-primary">*</span>
          <textarea
            rows={2}
            maxLength={500}
            value={tradeForm.changeReason}
            onChange={(event) =>
              setTradeForm((previous) => ({ ...previous, changeReason: event.target.value }))
            }
            placeholder={t("training.relation.changedReasonPlaceholder")}
            className="mt-1.5 w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm font-normal leading-5 text-foreground outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
          />
        </label>
      )}
    </section>
  );
}

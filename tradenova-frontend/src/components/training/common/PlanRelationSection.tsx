import { useState, type Dispatch, type SetStateAction } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { ReportDocumentResponse } from "@/types/training";
import type { PlanRelation, TradeForm } from "@/hooks/training/training.types";
import {
  selectPlanRelation,
  selectTradeScenario,
} from "@/hooks/training/trainingTradeReason";
import { decisionCurrentViewLabel } from "@/hooks/training/decisionCapture";

const RELATIONS: { value: PlanRelation; label: string }[] = [
  { value: "FOLLOWED_PLAN", label: "기존 계획 실행" },
  { value: "CHANGED_PLAN", label: "계획 변경" },
  { value: "UNPLANNED", label: "즉석 판단" },
];

type Props = {
  tradeForm: TradeForm;
  setTradeForm: Dispatch<SetStateAction<TradeForm>>;
  scenarios: ReportDocumentResponse[];
  disabled?: boolean;
};

export function PlanRelationSection({ tradeForm, setTradeForm, scenarios, disabled }: Props) {
  const [planOpen, setPlanOpen] = useState(false);
  const selectedIndex = scenarios.findIndex((item) => item.id === tradeForm.scenarioSnapshotId);
  const selectedPlan = selectedIndex >= 0 ? scenarios[selectedIndex] : null;
  const selectedVersion = selectedIndex >= 0 ? scenarios.length - selectedIndex : null;

  return (
    <section className="border-t border-border/30 pt-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold">이번 행동과 계획의 관계</h3>
        <p className="mt-1 text-xs text-muted-foreground">AI가 추측하지 않도록 직접 선택합니다.</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {RELATIONS.map((relation) => {
          const needsPlan = relation.value !== "UNPLANNED";
          return (
            <button
              key={relation.value}
              type="button"
              aria-pressed={tradeForm.planRelation === relation.value}
              disabled={disabled || (needsPlan && scenarios.length === 0)}
              title={needsPlan && scenarios.length === 0 ? "먼저 계획을 저장해주세요" : undefined}
              onClick={() =>
                setTradeForm((previous) => selectPlanRelation(previous, relation.value, scenarios))
              }
              className={`min-h-10 rounded-md border px-2 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 ${
                tradeForm.planRelation === relation.value
                  ? "border-primary/45 bg-primary/10 text-primary"
                  : "border-border/45 bg-muted/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {relation.label}
            </button>
          );
        })}
      </div>

      {tradeForm.planRelation && tradeForm.planRelation !== "UNPLANNED" && (
        <div className="mt-3">
          <label htmlFor="trade-plan" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            연결할 계획
          </label>
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPlanOpen(false);
            }}
          >
            <button
              id="trade-plan"
              type="button"
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={planOpen}
              disabled={disabled}
              onClick={() => setPlanOpen((open) => !open)}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border/65 bg-card px-3 text-left text-sm outline-none hover:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-40"
            >
              <span className="truncate">
                {selectedPlan
                  ? `v${selectedVersion} · ${decisionCurrentViewLabel(selectedPlan.contentJson.currentView ?? selectedPlan.contentJson.thesis)}`
                  : "계획을 선택해주세요"}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
            </button>
            {planOpen && (
              <div role="listbox" className="thin-scrollbar absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-48 overflow-y-auto rounded-md border border-border/75 bg-popover p-1 shadow-xl shadow-black/40">
                {scenarios.map((scenario, index) => (
                  <button
                    key={scenario.id}
                    type="button"
                    role="option"
                    aria-selected={selectedPlan?.id === scenario.id}
                    onClick={() => {
                      setTradeForm((previous) => selectTradeScenario(previous, scenario.id, scenarios));
                      setPlanOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[13px] hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="truncate">v{scenarios.length - index} · {decisionCurrentViewLabel(scenario.contentJson.currentView ?? scenario.contentJson.thesis)}</span>
                    {selectedPlan?.id === scenario.id && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPlan && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
              진입: {selectedPlan.contentJson.entryCondition ?? selectedPlan.contentJson.entryReason ?? "조건 미작성"}
            </p>
          )}
        </div>
      )}

      {tradeForm.planRelation === "CHANGED_PLAN" && (
        <label className="mt-3 block text-xs font-semibold text-muted-foreground">
          왜 계획을 변경했나요? <span className="text-primary">*</span>
          <textarea
            rows={2}
            maxLength={500}
            value={tradeForm.changeReason}
            onChange={(event) =>
              setTradeForm((previous) => ({ ...previous, changeReason: event.target.value }))
            }
            placeholder="예: 예상보다 강한 거래량 돌파를 확인함"
            className="mt-1.5 w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm font-normal leading-5 text-foreground outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
          />
        </label>
      )}
    </section>
  );
}

import { useState, type Dispatch, type SetStateAction } from "react";
import type { TradeForm } from "@/hooks/training/training.types";
import type {
  QuickPhraseResponse,
  ReportDocumentResponse,
} from "@/types/training";
import {
  calculateBuyQuantityByPercent,
  calculateSellQuantityByPercent,
  calculateEstimatedAmount,
  ORDER_PERCENTAGES,
} from "./trainingOrderCalculations";
import { updateActionReason } from "@/hooks/training/trainingWorkspaceState";
import { selectTradeScenario } from "@/hooks/training/trainingTradeReason";
import { Check, ChevronDown } from "lucide-react";

type Props = {
  side: "BUY" | "SELL";
  tradeForm: TradeForm;
  setTradeForm: Dispatch<SetStateAction<TradeForm>>;
  quickPhrases: QuickPhraseResponse[];
  scenarios: ReportDocumentResponse[];
  cashBalance: number;
  positionQty: number;
  currentPrice: number;
  setQuantity: (qty: number) => void;
  sellAllSelected: boolean;
  selectAll: () => void;
  disabled: boolean;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
  validQuantity: number;
};

export function TradeDialogContent({
  side,
  tradeForm,
  setTradeForm,
  quickPhrases,
  scenarios,
  cashBalance,
  positionQty,
  currentPrice,
  setQuantity,
  sellAllSelected,
  selectAll,
  disabled,
  loading,
  error,
  onCancel,
  onSubmit,
  validQuantity,
}: Props) {
  const [planOpen, setPlanOpen] = useState(false);
  const buying = side === "BUY";
  const selectedIndex =
    tradeForm.reasonMode === "SCENARIO"
      ? scenarios.findIndex((item) => item.id === tradeForm.scenarioSnapshotId)
      : -1;
  const selectedPlan = selectedIndex >= 0 ? scenarios[selectedIndex] : null;
  const selectedVersion =
    selectedIndex >= 0 ? scenarios.length - selectedIndex : null;
  const action = tradeForm.reasons?.find(
    (reason) => reason.id === "action-input",
  );
  const updateReason = (value: string) =>
    setTradeForm((prev) => updateActionReason(prev, value));
  const orderQuantity =
    !buying && sellAllSelected ? positionQty : validQuantity;
  const amount = calculateEstimatedAmount(orderQuantity, currentPrice);
  const unavailable =
    orderQuantity <= 0 ||
    (buying
      ? amount > cashBalance || currentPrice <= 0
      : orderQuantity > positionQty);
  return (
    <>
      <div className="thin-scrollbar min-h-0 space-y-4 overflow-y-auto px-5 pb-4">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/25 px-3 py-2.5 text-xs">
          <div>
            <dt className="text-muted-foreground">현재가</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {currentPrice.toLocaleString()}원
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-muted-foreground">
              {buying ? "사용 가능 현금" : "보유수량"}
            </dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {buying
                ? `${cashBalance.toLocaleString()}원`
                : `${positionQty.toLocaleString()}주`}
            </dd>
          </div>
        </dl>
        <fieldset disabled={loading} className="space-y-2">
          <label
            htmlFor="trade-quantity"
            className="block text-xs font-semibold"
          >
            수량
          </label>
          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-border/60 focus-within:border-primary/60">
            <button
              type="button"
              aria-label="수량 줄이기"
              onClick={() => setQuantity(Math.max(1, validQuantity - 1))}
              className="h-full w-10 text-lg hover:bg-muted/40"
            >
              −
            </button>
            <input
              id="trade-quantity"
              type="number"
              min={1}
              step={1}
              value={tradeForm.qty}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="no-number-spinner h-full min-w-0 flex-1 bg-transparent text-center text-sm font-semibold outline-none"
            />
            <button
              type="button"
              aria-label="수량 늘리기"
              onClick={() => setQuantity(validQuantity + 1)}
              className="h-full w-10 text-lg hover:bg-muted/40"
            >
              +
            </button>
          </div>
          <div
            className={`grid gap-1.5 ${buying ? "grid-cols-4" : "grid-cols-5"}`}
          >
            {ORDER_PERCENTAGES.map((percent) => {
              const qty = buying
                ? calculateBuyQuantityByPercent(
                    cashBalance,
                    currentPrice,
                    percent,
                  )
                : calculateSellQuantityByPercent(positionQty, percent);
              return (
                <button
                  key={percent}
                  type="button"
                  disabled={qty === 0}
                  onClick={() => setQuantity(qty)}
                  className="h-7 rounded-md bg-muted/35 text-[11px] font-medium hover:bg-muted/70 disabled:opacity-35"
                >
                  {percent}%
                </button>
              );
            })}
            {!buying && (
              <button
                type="button"
                aria-pressed={sellAllSelected}
                disabled={positionQty <= 0}
                onClick={selectAll}
                className={`h-7 rounded-md text-[11px] font-semibold disabled:opacity-35 ${sellAllSelected ? "bg-red-500/20 text-red-300" : "bg-muted/35 hover:bg-muted/70"}`}
              >
                ALL
              </button>
            )}
          </div>
        </fieldset>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">예상 주문금액</span>
          <strong className="text-base tabular-nums">
            {amount.toLocaleString()}원
          </strong>
        </div>
        <section className="border-t border-border/30 pt-3">
          <label
            htmlFor="trade-plan"
            className="mb-2 block text-sm font-semibold"
          >
            적용 계획
          </label>
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setPlanOpen(false);
            }}
          >
            <button
              id="trade-plan"
              type="button"
              role="combobox"
              aria-label="적용 계획"
              aria-haspopup="listbox"
              aria-expanded={planOpen}
              aria-controls="trade-plan-options"
              disabled={loading}
              onClick={() => setPlanOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && planOpen) {
                  event.stopPropagation();
                  setPlanOpen(false);
                }
              }}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border/65 bg-card px-3 text-left text-[13px] text-foreground outline-none transition hover:border-primary/45 hover:bg-muted/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-40"
            >
              <span className="truncate">
                {selectedPlan
                  ? `v${selectedVersion} · ${selectedPlan.contentJson.thesis || "관점 미작성"}${selectedIndex === 0 ? " (현재 계획)" : ""}`
                  : "계획 없이 거래"}
              </span>
              <ChevronDown
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-primary"
              />
            </button>
            {planOpen && (
              <div
                id="trade-plan-options"
                role="listbox"
                aria-label="적용 계획"
                className="thin-scrollbar absolute left-0 right-0 top-[calc(100%+4px)] z-20 max-h-52 overflow-y-auto rounded-md border border-border/75 bg-popover p-1 shadow-xl shadow-black/40"
              >
                {scenarios.map((scenario, index) => (
                  <button
                    key={scenario.id}
                    type="button"
                    role="option"
                    aria-selected={selectedPlan?.id === scenario.id}
                    onClick={() => {
                      setTradeForm((prev) =>
                        selectTradeScenario(prev, scenario.id, scenarios),
                      );
                      setPlanOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[13px] text-popover-foreground outline-none hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary aria-selected:text-primary"
                  >
                    <span className="truncate">
                      v{scenarios.length - index} ·{" "}
                      {scenario.contentJson.thesis || "관점 미작성"}
                      {index === 0 ? " (현재 계획)" : ""}
                    </span>
                    {selectedPlan?.id === scenario.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  role="option"
                  aria-selected={!selectedPlan}
                  onClick={() => {
                    setTradeForm((prev) =>
                      selectTradeScenario(prev, null, scenarios),
                    );
                    setPlanOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-[13px] text-popover-foreground outline-none hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary aria-selected:text-primary"
                >
                  계획 없이 거래
                  {!selectedPlan && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            )}
          </div>
          {selectedPlan && (
            <div className="mt-3 space-y-1 text-xs leading-5">
              <p className="font-semibold text-primary">
                PLAN · v{selectedVersion}
              </p>
              <p className="line-clamp-2 text-foreground/90">
                {selectedPlan.contentJson.thesis}
              </p>
              <p className="line-clamp-2 text-muted-foreground">
                진입: {selectedPlan.contentJson.entryReason || "조건 미작성"}
              </p>
            </div>
          )}
        </section>
        <fieldset disabled={loading} className="border-t border-border/35 pt-3">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">
            ACTION
          </div>
          <label
            htmlFor="trade-action"
            className="mb-2 mt-1 block text-sm font-semibold"
          >
            이번 {buying ? "매수" : "매도"} 근거
          </label>
          {selectedPlan && (
            <div className="mb-2 text-xs text-primary">
              PLAN · v{selectedVersion} 연결{" "}
              <span className="ml-1 text-muted-foreground">
                · 추가 근거 (선택)
              </span>
            </div>
          )}
          <textarea
            id="trade-action"
            rows={3}
            value={action?.entryReason ?? ""}
            onChange={(event) => updateReason(event.target.value)}
            placeholder={
              selectedPlan
                ? "계획 외에 이번 거래에서 추가로 본 점을 기록하세요."
                : "예: 돌파 이후 지지를 확인해 진입"
            }
            className="w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs leading-5 outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
          />
          {quickPhrases.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {quickPhrases.slice(0, 4).map((phrase) => (
                <button
                  key={phrase.id}
                  type="button"
                  onClick={() =>
                    updateReason(
                      [action?.entryReason, phrase.content]
                        .filter(Boolean)
                        .join("\n"),
                    )
                  }
                  className="max-w-full truncate rounded-full bg-muted/30 px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted/60"
                >
                  {phrase.content}
                </button>
              ))}
            </div>
          )}
          {tradeForm.reasons
            ?.filter((reason) => reason.id !== "action-input")
            .map((reason) => (
              <p key={reason.id} className="mt-2 text-xs text-muted-foreground">
                {reason.title} · {reason.entryReason}
              </p>
            ))}
        </fieldset>
        {error && (
          <p role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}
        {unavailable && (
          <p className="text-xs text-muted-foreground">
            {buying
              ? "현금 잔액 내에서 주문 수량을 설정해주세요."
              : "보유수량 내에서 매도 수량을 설정해주세요."}
          </p>
        )}
      </div>
      <footer className="flex shrink-0 justify-end gap-2 border-t border-border/35 px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-9 rounded-lg px-4 text-xs font-medium text-muted-foreground hover:bg-muted/40 disabled:opacity-40"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading || unavailable}
          className={`h-9 rounded-lg px-5 text-xs font-semibold disabled:opacity-40 ${buying ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-red-500 text-white hover:bg-red-500/90"}`}
        >
          {loading
            ? "처리 중..."
            : buying
              ? "매수 실행"
              : sellAllSelected
                ? "전량 매도 실행"
                : "매도 실행"}
        </button>
      </footer>
    </>
  );
}

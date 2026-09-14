import type { Dispatch, SetStateAction } from "react";
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

type Props = {
  side: "BUY" | "SELL";
  tradeForm: TradeForm;
  setTradeForm: Dispatch<SetStateAction<TradeForm>>;
  quickPhrases: QuickPhraseResponse[];
  latestScenario: ReportDocumentResponse | null;
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
  latestScenario,
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
  const buying = side === "BUY";
  const selected =
    tradeForm.reasonMode === "SCENARIO" &&
    latestScenario != null &&
    tradeForm.scenarioSnapshotId === latestScenario.id;
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
              className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-semibold outline-none"
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
        {latestScenario && (
          <section className="border-t border-border/35 pt-3">
            <div className="mb-1 text-[10px] font-bold tracking-widest text-primary">
              PLAN · 현재 계획
            </div>
            <p className="line-clamp-2 text-xs leading-5">
              {latestScenario.contentJson.thesis}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {buying
                ? latestScenario.contentJson.entryReason
                : latestScenario.contentJson.exitPlan ||
                  latestScenario.contentJson.riskNote}
            </p>
            <button
              type="button"
              aria-pressed={selected}
              disabled={loading}
              onClick={() =>
                setTradeForm((prev) => ({
                  ...prev,
                  reasonMode: selected ? "MANUAL" : "SCENARIO",
                  scenarioSnapshotId: selected ? null : latestScenario.id,
                }))
              }
              className={`mt-2 h-8 rounded-md px-3 text-xs font-semibold transition ${selected ? "bg-primary/15 text-primary" : "bg-muted/40 hover:bg-muted/65"}`}
            >
              {selected ? "✓ 현재 계획 사용" : "현재 계획 사용"}
            </button>
          </section>
        )}
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
          {selected && (
            <div className="mb-2 text-xs text-primary">
              ✓ 현재 계획 사용{" "}
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
              selected
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

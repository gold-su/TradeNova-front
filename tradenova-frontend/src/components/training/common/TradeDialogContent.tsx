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
import { canSubmitDecisionAction } from "@/hooks/training/trainingTradeReason";
import {
  removeQuickPhraseReason,
  selectedQuickPhraseIds,
  syncQuickPhraseReason,
  toggleQuickPhraseReason,
} from "@/hooks/training/quickPhraseSelection";
import { QuickPhrasePicker } from "../trade-reason/QuickPhrasePicker";
import { QuickPhraseManagerDialog } from "../trade-reason/QuickPhraseManagerDialog";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { PlanRelationSection } from "./PlanRelationSection";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  side: "BUY" | "SELL";
  tradeForm: TradeForm;
  setTradeForm: Dispatch<SetStateAction<TradeForm>>;
  quickPhrases: QuickPhraseResponse[];
  createQuickPhrase: (content: string) => Promise<QuickPhraseResponse>;
  updateQuickPhrase: (id: number, content: string) => Promise<QuickPhraseResponse>;
  deleteQuickPhrase: (id: number) => Promise<void>;
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

function won(value: number) {
  return `₩${Math.max(0, value).toLocaleString()}`;
}

export function TradeDialogContent({
  side,
  tradeForm,
  setTradeForm,
  quickPhrases,
  createQuickPhrase,
  updateQuickPhrase,
  deleteQuickPhrase,
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
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const [managerOpen, setManagerOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(() => Boolean(tradeForm.reasons?.length));
  const buying = side === "BUY";
  const action = tradeForm.reasons?.find(
    (reason) => reason.id === "action-input",
  );
  const selectedPhraseIds = selectedQuickPhraseIds(tradeForm);
  const updateReason = (value: string) =>
    setTradeForm((prev) => updateActionReason(prev, value));
  const orderQuantity =
    !buying && sellAllSelected ? positionQty : validQuantity;
  const amount = calculateEstimatedAmount(orderQuantity, currentPrice);
  const projectedCash = buying ? cashBalance - amount : cashBalance + amount;
  const projectedPosition = buying
    ? positionQty + orderQuantity
    : positionQty - orderQuantity;
  const extraReasonCount =
    selectedPhraseIds.size + (action?.entryReason.trim() ? 1 : 0);
  const unavailable =
    !canSubmitDecisionAction(tradeForm) ||
    orderQuantity <= 0 ||
    (buying
      ? amount > cashBalance || currentPrice <= 0
      : orderQuantity > positionQty);
  return (
    <>
      <div className="thin-scrollbar min-h-0 space-y-5 overflow-y-auto px-6 pb-5">
        <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/25 px-4 py-3 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("training.account.currentPrice")}</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              ₩{currentPrice.toLocaleString(locale)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-muted-foreground">
              {buying ? t("training.account.availableCash") : t("training.account.positionQty")}
            </dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">
              {buying
                ? `₩${cashBalance.toLocaleString(locale)}`
                : t("training.chart.shares", { count: positionQty.toLocaleString(locale) })}
            </dd>
          </div>
        </dl>
        <fieldset disabled={loading} className="space-y-3">
          <label
            htmlFor="trade-quantity"
            className="block text-sm font-semibold"
          >
            {t("training.action.quantity")}
          </label>
          <div className="flex h-11 items-center overflow-hidden rounded-lg border border-border/60 focus-within:border-primary/60">
            <button
              type="button"
              aria-label={t("training.tradeUi.decrease")}
              onClick={() => setQuantity(Math.max(1, validQuantity - 1))}
              className="h-full w-11 text-xl hover:bg-muted/40"
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
              className="no-number-spinner h-full min-w-0 flex-1 bg-transparent text-center text-base font-semibold outline-none"
            />
            <button
              type="button"
              aria-label={t("training.tradeUi.increase")}
              onClick={() => setQuantity(validQuantity + 1)}
              className="h-full w-11 text-xl hover:bg-muted/40"
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
                  className="h-8 rounded-md bg-muted/35 text-xs font-medium hover:bg-muted/70 disabled:opacity-35"
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
                className={`h-8 rounded-md text-xs font-semibold disabled:opacity-35 ${sellAllSelected ? "bg-red-500/20 text-red-300" : "bg-muted/35 hover:bg-muted/70"}`}
              >
                ALL
              </button>
            )}
          </div>
        </fieldset>
        <section
          className={`rounded-xl border px-4 py-3 ${buying ? "border-primary/20 bg-primary/[0.05]" : "border-red-500/20 bg-red-500/[0.05]"}`}
          aria-label={t("training.tradeUi.orderSummary", { side: buying ? t("training.action.buy") : t("training.action.sell") })}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className={`text-xs font-semibold ${buying ? "text-primary" : "text-red-300"}`}>
                {buying ? t("training.tradeUi.buyOrder") : t("training.tradeUi.sellOrder")}
              </div>
              <div className="mt-1 text-xl font-bold tabular-nums">
                {t("training.chart.shares", { count: orderQuantity.toLocaleString(locale) })}
              </div>
            </div>
            <div className="min-w-0 text-right">
              <div className="text-[11px] text-muted-foreground">
                {buying ? t("training.tradeUi.estimatedCost") : t("training.tradeUi.estimatedProceeds")}
              </div>
              <div className="mt-1 truncate text-2xl font-bold tabular-nums">
                {won(amount)}
              </div>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-4 border-t border-border/30 pt-3 text-sm">
            <div>
              <dt className="text-[11px] text-muted-foreground">
                {buying ? t("training.tradeUi.afterBuy") : t("training.tradeUi.afterSell")}
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">
                {t("training.chart.shares", { count: Math.max(0, projectedPosition).toLocaleString(locale) })}
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-[11px] text-muted-foreground">
                {buying ? t("training.tradeUi.remainingCash") : t("training.tradeUi.estimatedCash")}
              </dt>
              <dd className="mt-1 font-semibold tabular-nums">
                {won(projectedCash)}
              </dd>
            </div>
          </dl>
        </section>
        <PlanRelationSection
          tradeForm={tradeForm}
          setTradeForm={setTradeForm}
          scenarios={scenarios}
          disabled={loading}
        />
        <fieldset disabled={loading} className="border-t border-border/35 pt-3">
          <button
            type="button"
            aria-expanded={reasonOpen}
            onClick={() => setReasonOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-md py-1.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span>
              {reasonOpen
                ? t("training.tradeUi.hideReason")
                : extraReasonCount > 0
                  ? t("training.tradeUi.reasonCount", { count: extraReasonCount })
                  : t("training.tradeUi.addReason")}
            </span>
            {reasonOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {reasonOpen && (
            <div className="mt-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="trade-action" className="text-xs font-semibold">
                  {t("training.action.reason")} <span className="font-normal text-muted-foreground">({t("training.tradeUi.optional")})</span>
                </label>
                <button
                  type="button"
                  aria-label={t("training.tradeUi.manageReasons")}
                  title={t("training.tradeUi.manageReasons")}
                  onClick={() => setManagerOpen(true)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              </div>
              <QuickPhrasePicker
                items={quickPhrases}
                selectedIds={selectedPhraseIds}
                onToggle={(phrase) =>
                  setTradeForm((prev) => toggleQuickPhraseReason(prev, phrase))
                }
              />
              <textarea
                id="trade-action"
                rows={3}
                value={action?.entryReason ?? ""}
                onChange={(event) => updateReason(event.target.value)}
                placeholder={t("training.tradeUi.reasonPlaceholder", { side: buying ? t("training.action.buy") : t("training.action.sell") })}
                className="mt-2 w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
              />
            </div>
          )}
        </fieldset>
        {error && (
          <p role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}
        {unavailable && (
          <p className="text-xs text-muted-foreground">
            {!canSubmitDecisionAction(tradeForm)
              ? t("training.relation.required")
              : buying
                ? t("training.tradeUi.withinCash")
                : t("training.tradeUi.withinPosition")}
          </p>
        )}
      </div>
      <footer className="flex shrink-0 justify-end gap-2 border-t border-border/35 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-10 rounded-lg px-5 text-sm font-medium text-muted-foreground hover:bg-muted/40 disabled:opacity-40"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading || unavailable}
          className={`h-10 rounded-lg px-6 text-sm font-semibold disabled:opacity-40 ${buying ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-red-500 text-white hover:bg-red-500/90"}`}
        >
          {loading
            ? t("training.action.processing")
            : buying
              ? t("training.tradeUi.executeBuy")
              : sellAllSelected
                ? t("training.tradeUi.executeSellAll")
                : t("training.tradeUi.executeSell")}
        </button>
      </footer>
      {managerOpen && (
        <QuickPhraseManagerDialog
          items={quickPhrases}
          onClose={() => setManagerOpen(false)}
          onCreate={createQuickPhrase}
          onUpdate={updateQuickPhrase}
          onDelete={deleteQuickPhrase}
          onUpdatedSelection={(phrase) =>
            setTradeForm((prev) => syncQuickPhraseReason(prev, phrase))
          }
          onDeletedSelection={(id) =>
            setTradeForm((prev) => removeQuickPhraseReason(prev, id))
          }
        />
      )}
    </>
  );
}

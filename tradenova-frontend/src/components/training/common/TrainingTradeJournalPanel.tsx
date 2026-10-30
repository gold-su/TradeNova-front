import { WorkspaceDialog } from "./WorkspaceDialog";
import { TradeDialogContent } from "./TradeDialogContent";
import { useLayoutEffect, useMemo, useState } from "react";
import type {
  QuickPhraseResponse,
  ReportDocumentResponse,
} from "@/types/training";
import type { TradeForm } from "@/hooks/training/training.types";
import type { RiskRuleResponse, RiskRuleUpsertRequest } from "@/types/training";
import {
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsRight,
  ShieldAlert,
} from "lucide-react";
import {
  calculateRiskRuleExitQuantity,
  calculatePriceChangePercent,
  calculateTargetPrice,
  canConfigureRiskRule,
  EXIT_PERCENT_CHOICES,
  isValidExitPercent,
  riskRuleToDraft,
  submitRiskRuleDraft,
} from "./riskRuleForm";
import {
  canSubmitDecisionAction,
  clearPendingTradeReason,
  reconcileScenarioSelection,
} from "@/hooks/training/trainingTradeReason";
import { getScenarioHistory } from "@/hooks/training/trainingDecisionHistory";
import {
  updateActionReason,
  transitionOrderMode,
  type TrainingOrderMode,
} from "@/hooks/training/trainingWorkspaceState";
import { PlanRelationSection } from "./PlanRelationSection";
import { useI18n } from "@/i18n/LanguageProvider";

type Props = {
  tradeForm: TradeForm;
  setTradeForm: React.Dispatch<React.SetStateAction<TradeForm>>;
  quickPhrases: QuickPhraseResponse[];
  createQuickPhrase: (content: string) => Promise<QuickPhraseResponse>;
  updateQuickPhrase: (id: number, content: string) => Promise<QuickPhraseResponse>;
  deleteQuickPhrase: (id: number) => Promise<void>;
  disabled: boolean;
  loading: boolean;

  syncNext: boolean;
  setSyncNext: React.Dispatch<React.SetStateAction<boolean>>;

  lastSavedMessage?: {
    text: string;
    side: "BUY" | "SELL" | "WAIT";
  } | null;

  onBuy: () => Promise<boolean>;
  onSell: () => Promise<boolean>;
  onWait: () => Promise<boolean>;
  onSellAll: () => Promise<boolean>;
  onNext: () => void;

  advanceSteps: number;
  setAdvanceSteps: React.Dispatch<React.SetStateAction<number>>;

  riskRule: RiskRuleResponse | null;
  riskSaving: boolean;
  saveRiskRule: (body: RiskRuleUpsertRequest) => void | Promise<void>;
  cashBalance: number;
  positionQty: number;
  currentPrice: number;
  scenarioSnapshots: ReportDocumentResponse[];
  chartId: number | null;
};

function clampStep(value: number) {
  return Math.max(1, Math.min(value || 1, 500));
}

export function TrainingTradeJournalPanel({
  tradeForm,
  setTradeForm,
  quickPhrases,
  createQuickPhrase,
  updateQuickPhrase,
  deleteQuickPhrase,
  disabled,
  loading,
  syncNext,
  setSyncNext,
  lastSavedMessage,
  onBuy,
  onSell,
  onWait,
  onSellAll,
  onNext,
  advanceSteps,
  setAdvanceSteps,

  riskRule,
  riskSaving,
  saveRiskRule,
  cashBalance,
  positionQty,
  currentPrice,
  scenarioSnapshots,
  chartId,
}: Props) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const [orderMode, setOrderMode] = useState<TrainingOrderMode>(null);
  const [waitOpen, setWaitOpen] = useState(false);
  const [waitReasonOpen, setWaitReasonOpen] = useState(false);
  const [sellAllSelected, setSellAllSelected] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [riskOpen, setRiskOpen] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [riskDraft, setRiskDraft] = useState(() => riskRuleToDraft(riskRule));
  const riskRuleAvailable = canConfigureRiskRule(positionQty);
  const riskPercentValid =
    isValidExitPercent(riskDraft.stopLossExitPercent) &&
    isValidExitPercent(riskDraft.takeProfitExitPercent);
  const stopLossExitQuantity = calculateRiskRuleExitQuantity(
    positionQty,
    Number(riskDraft.stopLossExitPercent),
  );
  const takeProfitExitQuantity = calculateRiskRuleExitQuantity(
    positionQty,
    Number(riskDraft.takeProfitExitPercent),
  );

  const scenarios = useMemo(
    () => getScenarioHistory(scenarioSnapshots, chartId),
    [scenarioSnapshots, chartId],
  );
  useLayoutEffect(() => {
    setTradeForm((prev) => reconcileScenarioSelection(prev, scenarios));
  }, [scenarios, setTradeForm]);
  const openOrder = (side: "BUY" | "SELL") => {
    setOrderMode(side);
    setOrderError(null);
  };

  const validQuantity =
    Number.isInteger(Number(tradeForm.qty)) && Number(tradeForm.qty) > 0
      ? Number(tradeForm.qty)
      : 0;
  const setQuantity = (qty: number) => {
    setSellAllSelected(false);
    setTradeForm((prev) => ({ ...prev, qty }));
  };
  const clearDecisionAction = () => setTradeForm(clearPendingTradeReason);
  const closeOrder = () => {
    clearDecisionAction();
    setOrderMode(null);
    setSellAllSelected(false);
    setOrderError(null);
  };
  const closeWait = () => {
    clearDecisionAction();
    setWaitReasonOpen(false);
    setWaitOpen(false);
  };
  const savedMessageLines = lastSavedMessage?.text.split("\n") ?? [];

  const executeOrder = async () => {
    setOrderError(null);
    let succeeded = false;
    if (orderMode === "BUY") succeeded = await onBuy();
    if (orderMode === "SELL") {
      succeeded = sellAllSelected ? await onSellAll() : await onSell();
    }
    if (succeeded) {
      setOrderMode((current) =>
        transitionOrderMode(current, "TRADE_SUCCEEDED"),
      );
      setSellAllSelected(false);
    } else {
      setOrderError(
        t("training.tradeUi.orderFailed"),
      );
    }
  };

  return (
    <>
      <div className="pb-2">
        <div className="mb-3 h-12">
          {lastSavedMessage && (
            <div
              className={`flex h-full items-center gap-2 rounded-lg border px-3 text-xs ${
                lastSavedMessage.side === "BUY"
                  ? "border-primary/20 bg-primary/[0.06] text-primary"
                  : lastSavedMessage.side === "SELL"
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-sky-500/20 bg-sky-500/10 text-sky-200"
              }`}
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 leading-4">
                <div className="truncate font-semibold">{savedMessageLines[0]}</div>
                {savedMessageLines[1] && (
                  <div className="truncate opacity-80">{savedMessageLines[1]}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold tracking-[0.14em] text-primary/80">
                02 · ACTION
              </div>
              <div className="mt-1 text-sm font-semibold">{t("training.actionUi.heading")}</div>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                {t("training.actionUi.help")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => openOrder("BUY")}
                disabled={disabled}
                className={`h-9 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed ${loading ? "disabled:opacity-100" : "disabled:opacity-45"}`}
              >
                {t("training.action.buy")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWaitReasonOpen(false);
                  setWaitOpen(true);
                }}
                disabled={disabled}
                className={`h-9 rounded-lg bg-sky-500/10 text-sm font-bold text-sky-300 transition hover:bg-sky-500/15 disabled:cursor-not-allowed ${loading ? "disabled:opacity-100" : "disabled:opacity-45"}`}
              >
                {t("training.action.wait")}
              </button>
              <button
                type="button"
                onClick={() => openOrder("SELL")}
                disabled={disabled}
                className={`h-9 rounded-lg bg-red-500/15 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed ${loading ? "disabled:opacity-100" : "disabled:opacity-45"}`}
              >
                {t("training.action.sell")}
              </button>
            </div>

            <div className="pt-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-background/55 px-2">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={advanceSteps}
                    onChange={(e) =>
                      setAdvanceSteps(clampStep(Number(e.target.value)))
                    }
                    className="no-number-spinner h-7 w-12 bg-transparent text-center text-sm font-bold outline-none"
                  />
                  <span className="text-xs text-muted-foreground">{t("training.actionUi.candleUnit")}</span>
                </div>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={disabled}
                  className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/15 active:scale-[0.99] disabled:cursor-not-allowed ${loading ? "disabled:opacity-100" : "disabled:opacity-45"}`}
                >
                  {loading ? (
                    t("training.action.processing")
                  ) : (
                    <>
                      {t("training.action.next")}
                      <ChevronsRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRiskDraft(riskRuleToDraft(riskRule));
                    setRiskError(null);
                    setRiskOpen(true);
                  }}
                  disabled={!riskRuleAvailable}
                  title={
                    riskRuleAvailable
                      ? t("training.riskUi.configure")
                      : t("training.riskUi.unavailable")
                  }
                  className={[
                    "h-9 shrink-0 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
                    riskRule?.autoExitEnabled
                      ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                      : "border-border/50 bg-background/55 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t("training.risk.title")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSyncNext((prev) => !prev)}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-xs transition hover:bg-background/45"
              >
                <span className="text-muted-foreground">{t("training.actionUi.syncGrid")}</span>
                <span
                  className={
                    syncNext
                      ? "font-semibold text-primary"
                      : "font-semibold text-muted-foreground"
                  }
                >
                  {syncNext ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        }
      </div>
      {orderMode && (
        <WorkspaceDialog
          medium
          title={orderMode}
          description={t("training.tradeUi.orderDescription")}
          busy={loading}
          onClose={closeOrder}
        >
          <TradeDialogContent
            side={orderMode}
            tradeForm={tradeForm}
            setTradeForm={setTradeForm}
            quickPhrases={quickPhrases}
            createQuickPhrase={createQuickPhrase}
            updateQuickPhrase={updateQuickPhrase}
            deleteQuickPhrase={deleteQuickPhrase}
            scenarios={scenarios}
            cashBalance={cashBalance}
            positionQty={positionQty}
            currentPrice={currentPrice}
            setQuantity={setQuantity}
            sellAllSelected={sellAllSelected}
            selectAll={() => {
              setSellAllSelected(true);
              setTradeForm((prev) => ({ ...prev, qty: positionQty }));
            }}
            disabled={disabled}
            loading={loading}
            error={orderError}
            onCancel={closeOrder}
            onSubmit={executeOrder}
            validQuantity={validQuantity}
          />
        </WorkspaceDialog>
      )}
      {waitOpen && (
        <WorkspaceDialog
          medium
          title="WAIT"
          description={t("training.tradeUi.waitDescription")}
          busy={loading}
          onClose={closeWait}
        >
          <div className="thin-scrollbar min-h-0 space-y-4 overflow-y-auto px-6 pb-5">
            <PlanRelationSection
              tradeForm={tradeForm}
              setTradeForm={setTradeForm}
              scenarios={scenarios}
              disabled={loading}
            />
            <div className="border-t border-border/35 pt-3">
              <button
                type="button"
                aria-expanded={waitReasonOpen}
                onClick={() => setWaitReasonOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-md py-1.5 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{waitReasonOpen ? t("training.tradeUi.hideWaitReason") : t("training.tradeUi.addWaitReason")}</span>
                {waitReasonOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {waitReasonOpen && (
                <label className="mt-2 block text-xs font-semibold">
                  {t("training.tradeUi.waitReason")} <span className="font-normal text-muted-foreground">({t("training.tradeUi.optional")})</span>
                  <textarea
                    rows={3}
                    value={tradeForm.reasons.find((reason) => reason.id === "action-input")?.entryReason ?? ""}
                    onChange={(event) =>
                      setTradeForm((previous) =>
                        updateActionReason(previous, event.target.value),
                      )
                    }
                    placeholder={t("training.tradeUi.waitPlaceholder")}
                    className="mt-2 w-full resize-none rounded-lg border border-border/60 bg-muted/20 px-3.5 py-3 text-sm font-normal leading-6 outline-none placeholder:text-muted-foreground/65 focus:border-primary/60"
                  />
                </label>
              )}
            </div>
          </div>
          <footer className="flex shrink-0 justify-end gap-2 border-t border-border/35 px-6 py-4">
            <button
              type="button"
              onClick={closeWait}
              disabled={loading}
              className="h-10 rounded-lg px-5 text-sm text-muted-foreground hover:bg-muted/40"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={loading || !canSubmitDecisionAction(tradeForm)}
              onClick={async () => {
                if (await onWait()) setWaitOpen(false);
              }}
              className="h-10 rounded-lg bg-sky-500/15 px-6 text-sm font-semibold text-sky-200 hover:bg-sky-500/20 disabled:opacity-40"
            >
              {loading ? t("common.saving") : t("training.tradeUi.recordWait")}
            </button>
          </footer>
        </WorkspaceDialog>
      )}
      {riskOpen && (
        <WorkspaceDialog
          medium
          title={t("training.riskUi.configure")}
          description={t("training.riskUi.description")}
          busy={riskSaving}
          onClose={() => {
            setRiskOpen(false);
            setRiskError(null);
          }}
        >
          <div className="thin-scrollbar min-h-0 space-y-4 overflow-y-auto px-6 pb-5">
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/[0.08] px-3.5 py-3 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-300" />
              {t("training.riskUi.help")}
            </div>
            <div className="grid grid-cols-2 divide-x divide-border/40 rounded-xl border border-primary/20 bg-primary/5 py-3">
              <div className="px-4">
                <div className="text-xs text-muted-foreground">{t("training.account.currentPrice")}</div>
                <div className="mt-1 text-lg font-bold text-primary">
                  {Number.isFinite(currentPrice)
                    ? `₩${currentPrice.toLocaleString(locale)}`
                    : "-"}
                </div>
              </div>
              <div className="px-4">
                <div className="text-xs text-muted-foreground">{t("training.riskUi.currentPosition")}</div>
                <div className="mt-1 text-lg font-bold">
                  {t("training.chart.shares", { count: Math.max(0, Math.floor(positionQty)).toLocaleString(locale) })}
                </div>
              </div>
            </div>

            <RiskRuleSection
              title={t("training.riskUi.stop")}
              tone="loss"
              price={riskDraft.stopLossPrice}
              pricePlaceholder="예: 58000"
              onPriceChange={(value) =>
                setRiskDraft((prev) => ({ ...prev, stopLossPrice: value }))
              }
              percent={riskDraft.stopLossExitPercent}
              onPercentChange={(value) =>
                setRiskDraft((prev) => ({
                  ...prev,
                  stopLossExitPercent: value,
                }))
              }
              exitQuantity={stopLossExitQuantity}
              hasPosition={positionQty > 0}
              currentPrice={currentPrice}
            />

            <RiskRuleSection
              title={t("training.riskUi.take")}
              tone="profit"
              price={riskDraft.takeProfitPrice}
              pricePlaceholder="예: 72000"
              onPriceChange={(value) =>
                setRiskDraft((prev) => ({ ...prev, takeProfitPrice: value }))
              }
              percent={riskDraft.takeProfitExitPercent}
              onPercentChange={(value) =>
                setRiskDraft((prev) => ({
                  ...prev,
                  takeProfitExitPercent: value,
                }))
              }
              exitQuantity={takeProfitExitQuantity}
              hasPosition={positionQty > 0}
              currentPrice={currentPrice}
            />

            <button
              type="button"
              onClick={() =>
                setRiskDraft((prev) => ({
                  ...prev,
                  autoExitEnabled: !prev.autoExitEnabled,
                }))
              }
              className="flex h-11 w-full items-center justify-between rounded-xl bg-background/45 px-4 text-sm"
            >
              <span className="text-muted-foreground">{t("training.risk.autoExit")}</span>
              <span
                className={
                  riskDraft.autoExitEnabled
                    ? "font-bold text-primary"
                    : "font-bold text-muted-foreground"
                }
              >
                {riskDraft.autoExitEnabled ? "ON" : "OFF"}
              </span>
            </button>
            {riskError && (
              <p role="alert" className="text-sm text-red-300">
                {riskError}
              </p>
            )}
          </div>

          <footer className="flex shrink-0 items-center justify-between border-t border-border/35 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                setRiskError(null);
                setRiskDraft({
                  ...riskRuleToDraft(null),
                  autoExitEnabled: false,
                });
              }}
              className="h-10 rounded-xl px-4 text-sm text-muted-foreground hover:bg-background/60"
            >
              {t("training.riskUi.reset")}
            </button>

            <button
              type="button"
              disabled={riskSaving || !riskPercentValid || !riskRuleAvailable}
              onClick={async () => {
                setRiskError(null);
                try {
                  const saved = await submitRiskRuleDraft(
                    positionQty,
                    riskDraft,
                    saveRiskRule,
                  );
                  if (saved) setRiskOpen(false);
                } catch {
                  setRiskError(t("training.risk.saveFailed"));
                }
              }}
              className="h-10 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {riskSaving ? t("common.saving") : t("common.save")}
            </button>
          </footer>
        </WorkspaceDialog>
      )}
    </>
  );
}

function RiskRuleSection({
  title,
  tone,
  price,
  pricePlaceholder,
  onPriceChange,
  percent,
  onPercentChange,
  exitQuantity,
  hasPosition,
  currentPrice,
}: {
  title: string;
  tone: "loss" | "profit";
  price: string;
  pricePlaceholder: string;
  onPriceChange: (value: string) => void;
  percent: string;
  onPercentChange: (value: string) => void;
  exitQuantity: number;
  hasPosition: boolean;
  currentPrice: number;
}) {
  const { language, t } = useI18n();
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const [pricePickerOpen, setPricePickerOpen] = useState(false);
  const priceChangePercent = calculatePriceChangePercent(price, currentPrice);
  const candidatePercents = Array.from(
    { length: tone === "loss" ? 30 : 50 },
    (_, index) => (index + 1) * (tone === "loss" ? -1 : 1),
  );
  const formatPercent = (value: number) =>
    `${value > 0 ? "+" : ""}${Number(value.toFixed(2))}%`;
  const hasCurrentPrice = Number.isFinite(currentPrice) && currentPrice > 0;

  return (
    <section className="rounded-xl border border-border/40 bg-background/30 p-4">
      <div
        className={`mb-3 text-sm font-bold ${
          tone === "loss" ? "text-red-300" : "text-emerald-300"
        }`}
      >
        {title}
      </div>
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setPricePickerOpen(false);
          }
        }}
      >
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("training.riskUi.price", { title })}</span>
          {priceChangePercent !== null && (
            <span
              className={tone === "loss" ? "text-red-300" : "text-emerald-300"}
            >
              {t("training.riskUi.relative", { percent: formatPercent(priceChangePercent) })}
            </span>
          )}
        </div>
        <div className="flex rounded-lg border border-border/40 bg-background/55 focus-within:border-primary/45">
          <input
            aria-label={t("training.riskUi.price", { title })}
            type="number"
            value={price}
            onFocus={() => setPricePickerOpen(true)}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder={pricePlaceholder}
            className="h-10 min-w-0 flex-1 rounded-l-lg bg-transparent px-3 text-sm outline-none"
          />
          <button
            type="button"
            aria-label={t("training.riskUi.openCandidates", { title })}
            aria-expanded={pricePickerOpen}
            onClick={() => setPricePickerOpen((open) => !open)}
            className="flex w-10 items-center justify-center border-l border-border/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {pricePickerOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl">
            <div className="space-y-0.5 border-b border-border/50 bg-muted/20 px-3 py-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("training.account.currentPrice")}</span>
                <strong>
                  {hasCurrentPrice ? `₩${currentPrice.toLocaleString(locale)}` : "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("training.riskUi.selectedPrice")}</span>
                <strong>
                  {price && Number.isFinite(Number(price))
                    ? `₩${Number(price).toLocaleString(locale)}`
                    : "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("training.account.currentPrice")} %</span>
                <strong>
                  {priceChangePercent === null
                    ? "-"
                    : formatPercent(priceChangePercent)}
                </strong>
              </div>
            </div>
            {hasCurrentPrice ? (
              <div
                className="max-h-44 overflow-y-auto p-1"
                role="listbox"
                aria-label={t("training.riskUi.candidates", { title })}
              >
                {candidatePercents.map((candidatePercent) => {
                  const candidatePrice = calculateTargetPrice(
                    currentPrice,
                    candidatePercent,
                  )!;
                  const selected =
                    Number(price) === candidatePrice && price !== "";
                  return (
                    <button
                      key={candidatePercent}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onPriceChange(candidatePrice.toString());
                        setPricePickerOpen(false);
                      }}
                      className={`flex h-8 w-full items-center justify-between rounded-lg px-2 text-xs transition hover:bg-primary/10 ${selected ? "bg-primary/10 text-primary" : "text-foreground"}`}
                    >
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="w-4">
                          {selected && <Check className="h-3.5 w-3.5" />}
                        </span>
                        {formatPercent(candidatePercent)}
                      </span>
                      <span>₩{candidatePrice.toLocaleString(locale)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {t("training.riskUi.invalidCurrent")}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2">
        <ExitPercentControl
          label={t("training.riskUi.exitPercent")}
          value={percent}
          onChange={onPercentChange}
        />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-background/55 px-3 py-2 text-xs">
        <span className="text-muted-foreground">{t("training.riskUi.estimatedExit")}</span>
        <strong>
          {hasPosition
            ? t("training.riskUi.exitShares", { count: exitQuantity.toLocaleString(locale) })
            : t("training.riskUi.noPosition")}
        </strong>
      </div>
    </section>
  );
}

function ExitPercentControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const valid = isValidExitPercent(value);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        {!valid && <span className="text-red-300">{t("training.riskUi.percentInvalid")}</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-4 overflow-hidden rounded-lg border border-border/40">
          {EXIT_PERCENT_CHOICES.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => onChange(percent.toString())}
              className={`h-8 border-r border-border/40 text-xs font-semibold transition last:border-r-0 ${
                value === percent.toString()
                  ? "bg-primary/15 text-primary"
                  : "bg-background/45 text-muted-foreground hover:text-foreground"
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>
        <div className="relative w-[72px] border-l border-border/40 pl-2">
          <input
            aria-label={label}
            type="number"
            min={1}
            max={100}
            step={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`h-8 w-full rounded-lg border bg-background/55 pl-1 pr-4 text-right text-xs outline-none ${
              valid ? "border-border/40" : "border-red-400/60"
            }`}
          />
          <span className="pointer-events-none absolute right-1 top-1.5 text-xs text-muted-foreground">
            %
          </span>
        </div>
      </div>
    </div>
  );
}

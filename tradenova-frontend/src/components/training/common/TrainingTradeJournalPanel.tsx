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
  ChevronsRight,
  X,
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
  reconcileScenarioSelection,
} from "@/hooks/training/trainingTradeReason";
import { getScenarioHistory } from "@/hooks/training/trainingDecisionHistory";
import {
  transitionOrderMode,
  type TrainingOrderMode,
} from "@/hooks/training/trainingWorkspaceState";

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
    side: "BUY" | "SELL";
  } | null;

  onBuy: () => Promise<boolean>;
  onSell: () => Promise<boolean>;
  onSellAll: () => Promise<boolean>;
  onNext: () => void;

  advanceSteps: number;
  setAdvanceSteps: React.Dispatch<React.SetStateAction<number>>;

  riskRule: RiskRuleResponse | null;
  riskSaving: boolean;
  saveRiskRule: (body: RiskRuleUpsertRequest) => void;
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
  const [orderMode, setOrderMode] = useState<TrainingOrderMode>(null);
  const [sellAllSelected, setSellAllSelected] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [riskOpen, setRiskOpen] = useState(false);
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
        "주문이 완료되지 않았습니다. 수량과 계좌 상태를 확인한 뒤 다시 시도해주세요.",
      );
    }
  };

  return (
    <>
      <div className="pb-2">
        {lastSavedMessage && (
          <div
            className={`mb-3 flex h-9 items-center gap-2 rounded-lg border px-3 text-xs ${lastSavedMessage.side === "BUY" ? "border-primary/20 bg-primary/[0.06] text-primary" : "border-red-500/20 bg-red-500/10 text-red-300"}`}
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lastSavedMessage.text}</span>
          </div>
        )}

        {
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
                TRADE
              </div>
              <div className="text-sm font-semibold">거래 실행</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openOrder("BUY")}
                disabled={disabled}
                className="h-9 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-45"
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => openOrder("SELL")}
                disabled={disabled}
                className="h-9 rounded-lg bg-red-500/15 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-45"
              >
                SELL
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
                  <span className="text-xs text-muted-foreground">봉</span>
                </div>

                <button
                  type="button"
                  onClick={onNext}
                  disabled={disabled}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/15 active:scale-[0.99] disabled:opacity-45"
                >
                  {loading ? (
                    "처리 중..."
                  ) : (
                    <>
                      NEXT
                      <ChevronsRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRiskDraft(riskRuleToDraft(riskRule));
                    setRiskOpen(true);
                  }}
                  disabled={!riskRuleAvailable}
                  title={
                    riskRuleAvailable
                      ? "리스크룰 설정"
                      : "포지션을 먼저 매수한 후 설정할 수 있습니다"
                  }
                  className={[
                    "h-9 shrink-0 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
                    riskRule?.autoExitEnabled
                      ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                      : "border-border/50 bg-background/55 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  리스크
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSyncNext((prev) => !prev)}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-xs transition hover:bg-background/45"
              >
                <span className="text-muted-foreground">Grid 동시 진행</span>
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
          title={orderMode}
          description="현재 차트의 주문과 판단을 함께 기록합니다."
          busy={loading}
          onClose={() => {
            setOrderMode(null);
            setSellAllSelected(false);
            setOrderError(null);
          }}
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
            onCancel={() => {
              setOrderMode(null);
              setSellAllSelected(false);
              setOrderError(null);
            }}
            onSubmit={executeOrder}
            validQuantity={validQuantity}
          />
        </WorkspaceDialog>
      )}
      {riskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setRiskOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/45 bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <ShieldAlert className="h-4 w-4 text-red-300" />
                  리스크룰 설정
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  NEXT 진행 중 기준가 도달 시 자동 청산됩니다.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRiskOpen(false)}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 divide-x divide-border/40 rounded-xl border border-primary/20 bg-primary/5 py-2.5">
                <div className="px-3">
                  <div className="text-[11px] text-muted-foreground">
                    현재가
                  </div>
                  <div className="mt-0.5 text-base font-bold text-primary">
                    {Number.isFinite(currentPrice)
                      ? currentPrice.toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div className="px-3">
                  <div className="text-[11px] text-muted-foreground">
                    현재 보유
                  </div>
                  <div className="mt-0.5 text-base font-bold">
                    {Math.max(0, Math.floor(positionQty)).toLocaleString()}주
                  </div>
                </div>
              </div>

              <RiskRuleSection
                title="손절"
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
                title="익절"
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
                className="flex h-10 w-full items-center justify-between rounded-xl bg-background/45 px-3 text-sm"
              >
                <span className="text-muted-foreground">자동 청산</span>
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
            </div>

            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() =>
                  setRiskDraft({
                    ...riskRuleToDraft(null),
                    autoExitEnabled: false,
                  })
                }
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-background/60"
              >
                초기화
              </button>

              <button
                type="button"
                disabled={riskSaving || !riskPercentValid || !riskRuleAvailable}
                onClick={async () => {
                  const saved = await submitRiskRuleDraft(
                    positionQty,
                    riskDraft,
                    saveRiskRule,
                  );
                  if (saved) setRiskOpen(false);
                }}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {riskSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
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
    <section className="rounded-xl border border-border/40 bg-background/30 p-3">
      <div
        className={`mb-2 text-xs font-bold ${
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
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">{title} 가격</span>
          {priceChangePercent !== null && (
            <span
              className={tone === "loss" ? "text-red-300" : "text-emerald-300"}
            >
              현재가 대비 {formatPercent(priceChangePercent)}
            </span>
          )}
        </div>
        <div className="flex rounded-lg border border-border/40 bg-background/55 focus-within:border-primary/45">
          <input
            aria-label={`${title} 가격`}
            type="number"
            value={price}
            onFocus={() => setPricePickerOpen(true)}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder={pricePlaceholder}
            className="h-9 min-w-0 flex-1 rounded-l-lg bg-transparent px-3 text-sm outline-none"
          />
          <button
            type="button"
            aria-label={`${title} 가격 후보 열기`}
            aria-expanded={pricePickerOpen}
            onClick={() => setPricePickerOpen((open) => !open)}
            className="flex w-9 items-center justify-center border-l border-border/40 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {pricePickerOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl">
            <div className="space-y-0.5 border-b border-border/50 bg-muted/20 px-3 py-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">현재가</span>
                <strong>
                  {hasCurrentPrice ? `${currentPrice.toLocaleString()}원` : "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">선택가</span>
                <strong>
                  {price && Number.isFinite(Number(price))
                    ? `${Number(price).toLocaleString()}원`
                    : "-"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">현재가 대비</span>
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
                aria-label={`${title} 가격 후보`}
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
                      <span>{candidatePrice.toLocaleString()}원</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                유효한 현재가가 없어 가격 후보를 계산할 수 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-2">
        <ExitPercentControl
          label="청산 비율"
          value={percent}
          onChange={onPercentChange}
        />
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-background/55 px-3 py-1.5 text-xs">
        <span className="text-muted-foreground">예상 청산수량</span>
        <strong>
          {hasPosition
            ? `${exitQuantity.toLocaleString()}주 청산`
            : "0주 (보유 포지션 없음)"}
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
  const valid = isValidExitPercent(value);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        {!valid && <span className="text-red-300">1~100 정수만 입력</span>}
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

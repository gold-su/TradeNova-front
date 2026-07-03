import { useMemo, useState } from "react";
import type { QuickPhraseResponse } from "@/types/training";
import type {
  TradeForm,
  TradeReasonItem,
} from "@/hooks/training/training.types";
import type { RiskRuleResponse, RiskRuleUpsertRequest } from "@/types/training";
import {
  CheckCircle2,
  ChevronsRight,
  FileText,
  X,
  ShieldAlert,
  Target,
  Sparkles,
  Trash2,
  Plus,
} from "lucide-react";

type Props = {
  tradeForm: TradeForm;
  setTradeForm: React.Dispatch<React.SetStateAction<TradeForm>>;
  quickPhrases: QuickPhraseResponse[];
  disabled: boolean;
  loading: boolean;
  syncNext: boolean;
  setSyncNext: React.Dispatch<React.SetStateAction<boolean>>;
  lastSavedMessage?: {
    text: string;
    side: "BUY" | "SELL";
  } | null;
  onBuy: () => void;
  onSell: () => void;
  onSellAll: () => void;
  onNext: () => void;
  advanceSteps: number;
  setAdvanceSteps: React.Dispatch<React.SetStateAction<number>>;
  riskRule: RiskRuleResponse | null;
  riskSaving: boolean;
  saveRiskRule: (body: RiskRuleUpsertRequest) => void;
  riskRule,
  riskSaving,
  saveRiskRule,
};

type ReasonView = "ADD" | string;

function clampStep(value: number) {
  return Math.max(1, Math.min(value || 1, 500));
}

function makeReasonTitle(entryReason: string, riskNote: string, index: number) {
  const firstLine =
    entryReason
      .split("\n")
      .map((v) => v.trim())
      .find(Boolean) ||
    riskNote
      .split("\n")
      .map((v) => v.trim())
      .find(Boolean);

  return firstLine ? firstLine.slice(0, 18) : `근거 ${index + 1}`;
}

function createReasonId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TrainingTradeJournalPanel({
  tradeForm,
  setTradeForm,
  quickPhrases,
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
}: Props) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ReasonView>("ADD");

  const [draftReason, setDraftReason] = useState({
    entryReason: "",
    riskNote: "",
  });

  const reasons = tradeForm.reasons ?? [];
  const selectedReason = useMemo(
    () => reasons.find((item) => item.id === selectedView) ?? null,
    [reasons, selectedView],
  );

  const hasReasons = reasons.length > 0;

  const appendQuickPhrase = (content: string) => {
    setDraftReason((prev) => ({
      ...prev,
      entryReason: [prev.entryReason, content].filter(Boolean).join("\n"),
    }));
  };

  const resetDraft = () => {
    setDraftReason({
      entryReason: "",
      riskNote: "",
    });
  };

  const addReason = () => {
    const entryReason = draftReason.entryReason.trim();
    const riskNote = draftReason.riskNote.trim();

    if (!entryReason && !riskNote) return;

    const nextReason: TradeReasonItem = {
      id: createReasonId(),
      title: makeReasonTitle(entryReason, riskNote, reasons.length),
      entryReason,
      riskNote,
      createdAt: new Date().toISOString(),
    };

    setTradeForm((prev) => ({
      ...prev,
      reasons: [...(prev.reasons ?? []), nextReason],
      entryReason: "",
      riskNote: "",
    }));

    resetDraft();
    setSelectedView(nextReason.id);
  };

  const deleteReason = (id: string) => {
    setTradeForm((prev) => ({
      ...prev,
      reasons: (prev.reasons ?? []).filter((item) => item.id !== id),
    }));

    if (selectedView === id) {
      setSelectedView("ADD");
    }
  };

  const openReasonModal = () => {
    setReasonOpen(true);
    setSelectedView(hasReasons ? reasons[0].id : "ADD");
  };

  const savedTone =
    lastSavedMessage?.side === "SELL" ? "text-red-300" : "text-primary";

  return (
    <>
      <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">매매 결정</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              수량, 근거, 진행 단위를 설정합니다.
            </div>
          </div>

          {lastSavedMessage && (
            <div
              className={[
                "flex shrink-0 items-center gap-1.5 rounded-md bg-background/45 px-2 py-1 text-[11px]",
                savedTone,
              ].join(" ")}
              title={lastSavedMessage.text}
            >
              <CheckCircle2 className="h-3 w-3" />
              저장됨
            </div>
          )}
        </div>

        {lastSavedMessage && (
          <div
            className={[
              "mb-3 truncate rounded-lg px-3 py-2 text-xs",
              lastSavedMessage.side === "BUY"
                ? "bg-primary/[0.06] text-primary"
                : "bg-red-500/10 text-red-300",
            ].join(" ")}
          >
            {lastSavedMessage.text}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="shrink-0 text-[11px] font-medium text-muted-foreground">
              수량
            </label>

            <input
              type="number"
              min={0.000001}
              step="any"
              value={tradeForm.qty}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  qty: Number(e.target.value),
                }))
              }
              className="h-8 w-20 rounded-lg border border-border/40 bg-background/55 px-3 text-sm font-semibold outline-none transition focus:border-primary/45 focus:bg-background/70"
            />

            <div className="flex-1" />

            <button
              type="button"
              onClick={openReasonModal}
              className={[
                "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition",
                hasReasons
                  ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                  : "border-amber-500/25 bg-amber-500/15 text-amber-300 hover:bg-amber-500/20",
              ].join(" ")}
            >
              <FileText className="h-3.5 w-3.5" />
              {hasReasons ? `근거 ${reasons.length}개` : "근거 작성"}
            </button>
          </div>

          {hasReasons && (
            <button
              type="button"
              onClick={openReasonModal}
              className="w-full rounded-lg bg-background/35 px-3 py-2 text-left transition hover:bg-primary/[0.04]"
            >
              <div className="text-xs font-semibold text-foreground">
                매매 근거 {reasons.length}개 저장됨
              </div>
              <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                {reasons[reasons.length - 1]?.title}
              </div>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onBuy}
              disabled={disabled}
              className="h-9 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:brightness-110 active:scale-[0.98] disabled:opacity-45"
            >
              BUY
            </button>

            <button
              type="button"
              onClick={onSell}
              disabled={disabled}
              className="h-9 rounded-lg bg-red-500/15 text-sm font-bold text-red-300 transition hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-45"
            >
              SELL
            </button>

            <button
              type="button"
              onClick={onSellAll}
              disabled={disabled}
              className="h-9 rounded-lg bg-background/55 text-sm font-bold text-muted-foreground transition hover:bg-background/75 hover:text-foreground active:scale-[0.98] disabled:opacity-45"
            >
              ALL
            </button>
          </div>

          <div className="rounded-lg bg-background/35 p-2">
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
                  className="h-7 w-12 bg-transparent text-center text-sm font-bold outline-none"
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
      </div>

      {reasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 cursor-default"
            onClick={() => setReasonOpen(false)}
          />

          <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-3xl border border-border/45 bg-background shadow-2xl">
            <aside className="max-h-[560px] w-[190px] shrink-0 border-r border-border/35 bg-background/35 p-3">
              <button
                type="button"
                onClick={() => setSelectedView("ADD")}
                className={[
                  "mb-2 flex h-12 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-semibold transition",
                  selectedView === "ADD"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                ].join(" ")}
              >
                <Plus className="h-4 w-4" />
                추가
              </button>

              <div className="thin-scrollbar space-y-1 overflow-y-auto">
                {reasons.map((reason, index) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedView(reason.id)}
                    className={[
                      "w-full rounded-2xl px-3 py-3 text-left transition",
                      selectedView === reason.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    ].join(" ")}
                  >
                    <div className="text-xs font-semibold">근거 {index + 1}</div>
                    <div className="mt-1 line-clamp-1 text-[11px] opacity-80">
                      {reason.title}
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between border-b border-border/35 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <Sparkles className="h-4 w-4 text-primary" />
                    매매 근거
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    매매 근거를 작성하세요.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReasonOpen(false)}
                  className="rounded-xl p-2 text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="thin-scrollbar max-h-[72vh] space-y-2 overflow-y-auto px-5 py-4">
                {selectedView === "ADD" ? (
                  <div className="space-y-4">
                    {quickPhrases.length > 0 && (
                      <section className="rounded-2xl bg-background/35 p-2">
                        <div className="mb-2 text-xs font-semibold text-muted-foreground">
                          빠른 입력
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {quickPhrases.slice(0, 8).map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => appendQuickPhrase(item.content)}
                              className="rounded-full bg-background/55 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-primary/[0.08] hover:text-primary"
                            >
                              {item.title || item.content.slice(0, 12)}
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="rounded-2xl bg-background/35 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        매매 근거
                      </div>

                      <textarea
                        rows={9}
                        value={draftReason.entryReason}
                        onChange={(e) =>
                          setDraftReason((prev) => ({
                            ...prev,
                            entryReason: e.target.value,
                          }))
                        }
                        placeholder={`예:
- 전고점 돌파 후 거래량 증가
- 눌림 구간에서 지지 확인
- 추세선 이탈 전까지 보유`}
                        className="w-full resize-none rounded-xl border border-border/35 bg-background/55 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/45 focus:border-primary/45 focus:bg-background/70"
                      />
                    </section>

                    <section className="rounded-2xl bg-background/35 p-3">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-300" />
                        리스크 메모
                      </div>

                      <textarea
                        rows={5}
                        value={draftReason.riskNote}
                        onChange={(e) =>
                          setDraftReason((prev) => ({
                            ...prev,
                            riskNote: e.target.value,
                          }))
                        }
                        placeholder={`예:
- 직전 저점 이탈 시 정리
- 비중 과다 주의
- 추격 매수 금지`}
                        className="w-full resize-none rounded-xl border border-border/35 bg-background/55 px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/45 focus:border-primary/45 focus:bg-background/70"
                      />
                    </section>
                  </div>
                ) : selectedReason ? (
                  <div className="space-y-4">
                    <section className="rounded-2xl bg-background/35 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                        <Target className="h-3.5 w-3.5 text-primary" />
                        매매 근거
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {selectedReason.entryReason || "-"}
                      </div>
                    </section>

                    <section className="rounded-2xl bg-background/35 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                        <ShieldAlert className="h-3.5 w-3.5 text-red-300" />
                        리스크 메모
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                        {selectedReason.riskNote || "-"}
                      </div>
                    </section>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-border/35 px-5 py-4">
                {selectedView === "ADD" ? (
                  <>
                    <button
                      type="button"
                      onClick={resetDraft}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      비우기
                    </button>

                    <button
                      type="button"
                      onClick={addReason}
                      disabled={
                        !draftReason.entryReason.trim() &&
                        !draftReason.riskNote.trim()
                      }
                      className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-40"
                    >
                      근거 추가
                    </button>
                  </>
                ) : selectedReason ? (
                  <>
                    <button
                      type="button"
                      onClick={() => deleteReason(selectedReason.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>

                    <button
                      type="button"
                      onClick={() => setReasonOpen(false)}
                      className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
                    >
                      확인
                    </button>
                  </>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
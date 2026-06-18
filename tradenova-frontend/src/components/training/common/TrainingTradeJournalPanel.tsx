import { useState } from "react";
import type { QuickPhraseResponse } from "@/types/training";
import {
  CheckCircle2,
  ChevronsRight,
  FileText,
  X,
  ShieldAlert,
  Target,
  Sparkles,
  Trash2,
} from "lucide-react";

type TradeForm = {
  qty: number;
  entryReason: string;
  riskNote: string;
};

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
};

function clampStep(value: number) {
  return Math.max(1, Math.min(value || 1, 500));
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

  const hasReason =
    tradeForm.entryReason.trim().length > 0 ||
    tradeForm.riskNote.trim().length > 0;

  const appendReason = (content: string) => {
    setTradeForm((prev) => ({
      ...prev,
      entryReason: [prev.entryReason, content].filter(Boolean).join("\n"),
    }));
  };

  const clearReason = () => {
    setTradeForm((prev) => ({
      ...prev,
      entryReason: "",
      riskNote: "",
    }));
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
              onClick={() => setReasonOpen(true)}
              className={[
                "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
                hasReason
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/25 animate-pulse",
              ].join(" ")}
            >
              <FileText className="h-3.5 w-3.5" />
              {hasReason ? "근거 작성 완료" : "⚠ 매매 근거 작성"}
            </button>
          </div>

          {hasReason && (
            <button
              type="button"
              onClick={() => setReasonOpen(true)}
              className="w-full rounded-lg bg-background/35 px-3 py-2 text-left transition hover:bg-primary/[0.04]"
            >
              <div className="line-clamp-1 text-xs font-medium text-foreground">
                {tradeForm.entryReason || "리스크 메모만 입력됨"}
              </div>
              {tradeForm.riskNote && (
                <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                  리스크: {tradeForm.riskNote}
                </div>
              )}
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
                  onChange={(e) => setAdvanceSteps(clampStep(Number(e.target.value)))}
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

          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border/45 bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border/35 px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  매매 근거 작성
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  다음 BUY / SELL / ALL 실행 시 이 근거가 거래 로그와 AI 리뷰에 저장됩니다.
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

            <div className="thin-scrollbar max-h-[72vh] space-y-4 overflow-y-auto px-5 py-4">
              {quickPhrases.length > 0 && (
                <section className="rounded-2xl bg-background/35 p-3">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    빠른 입력
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {quickPhrases.slice(0, 8).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => appendReason(item.content)}
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
                  rows={7}
                  value={tradeForm.entryReason}
                  onChange={(e) =>
                    setTradeForm((prev) => ({
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
                  rows={4}
                  value={tradeForm.riskNote}
                  onChange={(e) =>
                    setTradeForm((prev) => ({
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

            <div className="flex items-center justify-between border-t border-border/35 px-5 py-4">
              <button
                type="button"
                onClick={clearReason}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-background/60 hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" />
                비우기
              </button>

              <button
                type="button"
                onClick={() => setReasonOpen(false)}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                근거 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
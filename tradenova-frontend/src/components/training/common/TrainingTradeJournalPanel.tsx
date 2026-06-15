import type { QuickPhraseResponse } from "@/types/training";
import { CheckCircle2, ChevronsRight } from "lucide-react";

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
};

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
}: Props) {
    const appendReason = (content: string) => {
        setTradeForm((prev) => ({
            ...prev,
            entryReason: [prev.entryReason, content].filter(Boolean).join("\n"),
        }));
    };

    const savedTone =
        lastSavedMessage?.side === "SELL"
            ? "text-red-300"
            : "text-primary";

    return (
        <div className="rounded-xl border border-border/45 bg-background/25 p-3 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold">매매 결정</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                        근거를 남기고 실행하면 로그와 AI 리뷰에 반영됩니다.
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
                        className="h-8 w-full rounded-lg border border-border/40 bg-background/55 px-3 text-sm font-semibold outline-none transition focus:border-primary/45 focus:bg-background/70"
                    />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-[11px] font-medium text-muted-foreground">
                            매매 근거
                        </label>

                        {quickPhrases.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                                빠른 입력
                            </span>
                        )}
                    </div>

                    {quickPhrases.length > 0 && (
                        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
                            {quickPhrases.slice(0, 6).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => appendReason(item.content)}
                                    className="shrink-0 rounded-full bg-background/50 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-primary/[0.06] hover:text-primary"
                                >
                                    {item.title || item.content.slice(0, 10)}
                                </button>
                            ))}
                        </div>
                    )}

                    <textarea
                        rows={3}
                        value={tradeForm.entryReason}
                        onChange={(e) =>
                            setTradeForm((prev) => ({
                                ...prev,
                                entryReason: e.target.value,
                            }))
                        }
                        placeholder="예: 전고점 돌파, 거래량 증가, 눌림 지지 확인"
                        className="w-full resize-none rounded-lg border border-border/40 bg-background/55 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45 focus:bg-background/70"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                        리스크 메모
                    </label>

                    <textarea
                        rows={2}
                        value={tradeForm.riskNote}
                        onChange={(e) =>
                            setTradeForm((prev) => ({
                                ...prev,
                                riskNote: e.target.value,
                            }))
                        }
                        placeholder="예: 손절 기준 이탈 시 정리, 비중 과다 주의"
                        className="w-full resize-none rounded-lg border border-border/40 bg-background/55 px-3 py-2 text-sm leading-5 outline-none transition placeholder:text-muted-foreground/55 focus:border-primary/45 focus:bg-background/70"
                    />
                </div>

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
                    <button
                        type="button"
                        onClick={onNext}
                        disabled={disabled}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary/10 text-sm font-bold text-primary transition hover:bg-primary/15 active:scale-[0.99] disabled:opacity-45"
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
                        onClick={() => setSyncNext((prev) => !prev)}
                        className="mt-2 flex h-8 w-full items-center justify-between rounded-md px-2 text-xs transition hover:bg-background/45"
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
    );
}

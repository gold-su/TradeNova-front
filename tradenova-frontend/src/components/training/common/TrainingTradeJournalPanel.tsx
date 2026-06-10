import type { QuickPhraseResponse } from "@/types/training";

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
    lastSavedMessage?: string | null;
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

    return (
        <div className="rounded-xl border border-border/60 bg-background/30 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold">Trade Journal</div>
                    <div className="text-[11px] text-muted-foreground">
                        매매 근거는 거래 로그와 AI 리뷰에 저장됩니다.
                    </div>
                </div>

                {lastSavedMessage && (
                    <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[11px] text-primary">
                        저장됨
                    </span>
                )}
            </div>

            {lastSavedMessage && (
                <div className="mb-3 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-xs text-primary">
                    {lastSavedMessage}
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
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
                        className="h-9 w-full rounded-lg border border-border/50 bg-background/60 px-3 text-sm outline-none focus:border-primary/40"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                        매매 근거
                    </label>

                    <div className="mb-2 flex flex-wrap gap-1.5">
                        {quickPhrases.slice(0, 6).map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => appendReason(item.content)}
                                className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-[11px] text-muted-foreground hover:border-border hover:text-foreground"
                            >
                                {item.title || item.content.slice(0, 10)}
                            </button>
                        ))}
                    </div>

                    <textarea
                        rows={4}
                        value={tradeForm.entryReason}
                        onChange={(e) =>
                            setTradeForm((prev) => ({
                                ...prev,
                                entryReason: e.target.value,
                            }))
                        }
                        placeholder="예: 전고점 돌파 후 거래량 증가, 눌림 구간에서 지지 확인"
                        className="w-full resize-none rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/40"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
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
                        placeholder="예: 손절 기준 이탈 시 즉시 정리"
                        className="w-full resize-none rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/40"
                    />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                        onClick={onBuy}
                        disabled={disabled}
                        className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                        BUY
                    </button>

                    <button
                        onClick={onSell}
                        disabled={disabled}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 disabled:opacity-50"
                    >
                        SELL
                    </button>

                    <button
                        onClick={onSellAll}
                        disabled={disabled}
                        className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
                    >
                        ALL
                    </button>
                </div>

                <div className="border-t border-border/40 pt-3">
                    <button
                        onClick={onNext}
                        disabled={disabled}
                        className="h-11 w-full rounded-lg border border-primary/35 bg-primary/10 text-sm font-bold text-primary hover:bg-primary/15 disabled:opacity-50"
                    >
                        {loading ? "처리 중..." : "NEXT"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setSyncNext((prev) => !prev)}
                        className="mt-2 flex w-full items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2 text-xs"
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
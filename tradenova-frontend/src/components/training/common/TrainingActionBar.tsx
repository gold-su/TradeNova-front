type Props = {
  disabled: boolean;
  loading: boolean;
  onNext: () => void;
  onSellAll: () => void;
  onBuy: () => void;
  onSell: () => void;
};

export function TrainingActionBar({
  disabled,
  loading,
  onNext,
  onSellAll,
  onBuy,
  onSell,
}: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">Actions</div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onNext}
          disabled={disabled}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "처리 중..." : "NEXT"}
        </button>

        <button
          onClick={onBuy}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          BUY
        </button>

        <button
          onClick={onSell}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          SELL
        </button>

        <button
          onClick={onSellAll}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          SELL ALL
        </button>
      </div>
    </div>
  );
}

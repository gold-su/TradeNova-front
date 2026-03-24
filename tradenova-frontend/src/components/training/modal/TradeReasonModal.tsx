type TradeForm = {
  qty: number;
  entryReason: string;
  riskNote: string;
};

type Props = {
  open: boolean;
  tradeType: "BUY" | "SELL" | null;
  tradeForm: TradeForm;
  setTradeForm: React.Dispatch<React.SetStateAction<TradeForm>>;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function TradeReasonModal({
  open,
  tradeType,
  tradeForm,
  setTradeForm,
  loading,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !tradeType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-background p-5 shadow-2xl">
        <div className="mb-4 text-lg font-semibold">{tradeType} 사유 입력</div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">수량</label>
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
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              진입/청산 사유
            </label>
            <textarea
              rows={4}
              value={tradeForm.entryReason}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  entryReason: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              리스크 메모
            </label>
            <textarea
              rows={3}
              value={tradeForm.riskNote}
              onChange={(e) =>
                setTradeForm((prev) => ({
                  ...prev,
                  riskNote: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border/60 px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "처리 중..." : `${tradeType} 실행`}
          </button>
        </div>
      </div>
    </div>
  );
}

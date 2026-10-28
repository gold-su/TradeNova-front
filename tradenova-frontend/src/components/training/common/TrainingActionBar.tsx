import { useI18n } from "@/i18n/LanguageProvider";

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
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4">
      <div className="mb-3 text-sm font-semibold">{t("training.action.action")}</div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onNext}
          disabled={disabled}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? t("training.action.processing") : t("training.action.next")}
        </button>

        <button
          onClick={onBuy}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          {t("training.action.buy")}
        </button>

        <button
          onClick={onSell}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          {t("training.action.sell")}
        </button>

        <button
          onClick={onSellAll}
          disabled={disabled}
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm disabled:opacity-50"
        >
          {t("training.action.sellAll")}
        </button>
      </div>
    </div>
  );
}

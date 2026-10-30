import { useI18n } from "@/i18n/LanguageProvider";

type Tab = "variables" | "style";

type Props = {
  value: Tab;
  onChange: (tab: Tab) => void;
};

export function IndicatorConfigTabs({ value, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-5 text-sm">
      <button
        type="button"
        onClick={() => onChange("variables")}
        className={[
          "pb-2 transition-colors",
          value === "variables"
            ? "border-b border-foreground text-foreground"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        {t("training.indicator.variables")}
      </button>

      <button
        type="button"
        onClick={() => onChange("style")}
        className={[
          "pb-2 transition-colors",
          value === "style"
            ? "border-b border-foreground text-foreground"
            : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
      >
        {t("training.indicator.style")}
      </button>
    </div>
  );
}
